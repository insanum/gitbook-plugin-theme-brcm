
var _ = require('lodash');

function generateSectionNumbers(content, section) {
    var s = '';
    var level = 0;
    var chapter = [ ];

    _.map(content.split('\n'), function (l) {
        var rgx = l.match(/^(#+)\s+(.+)$/);
        if (!rgx) {
            s += `${l}\n`;
            return;
        }

        if (rgx[1].length > chapter.length) {
            /* new level, add a new sub-section */
            if (rgx[1].length !== (chapter.length + 1)) {
                console.log(`ERROR: invalid header level jump ("${l}")`);
                process.exit(1);
            }
            chapter.push((chapter.length == 0) ? section : 1);
        } else if (rgx[1].length == chapter.length) {
            /* same level, increase current section number */
            chapter[chapter.length - 1]++;
        } else { /* (rgx[1].length < chapter.length) */
            /* back to the parent, remove sub-section, increase parent */
            var cut = (chapter.length - rgx[1].length);
            chapter.splice((chapter.length - cut), cut);
            chapter[chapter.length - 1]++;
        }

        s += `${rgx[1]} ` +
             `<span class="header_level">${chapter.join('.')}.</span> ` +
             `${rgx[2]}\n`;
        return;
    });

    return s;
}

var injectLevels = false;

module.exports = {
    hooks: {
        config: function(config) {
            if (config.pluginsConfig['theme-brcm'].noLevel == false)
                injectLevels = true;
            config.styles = config.styles || config.pluginsConfig['theme-brcm'].styles;

            return config;
        },
        'page:before': function(page) {
            if (injectLevels) {
                var section = page.level.match(/^([0-9]+)\..*$/)[1];
                page.content = generateSectionNumbers(page.content, section);
            }
            return page;
        }
    }
};

