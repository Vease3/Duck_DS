/*  style-dictionary/config.dark.js  */

const StyleDictionary = require('style-dictionary');

/* ---------- 1.  PARSER  -------------------------------------------------- */
/* Converts every "$value" → "value" (and "$type" → "type") so Style
   Dictionary recognises them as real tokens. */
StyleDictionary.registerParser({
  pattern: /\.json$/,
  parse: ({ contents }) => {
    const data = JSON.parse(contents);

    const walk = (node) => {
      if (node && typeof node === 'object') {
        if (node.$value !== undefined) {
          node.value = node.$value;
          delete node.$value;
        }
        if (node.$type !== undefined) {
          node.type = node.$type;       // optional, but nice to keep
          delete node.$type;
        }
        Object.values(node).forEach(walk);
      }
    };

    walk(data);
    return data;
  }
});

/* ---------- 2.  TRANSFORMS  ---------------------------------------------- */
StyleDictionary.registerTransform({
  name: 'duck/name/kebab',
  type: 'name',
  transformer: (token) => token.path.join('-').toLowerCase()
});

StyleDictionary.registerTransformGroup({
  name: 'duck/css',
  transforms: [
    'attribute/cti',   // built-in (adds category/type/item)
    'duck/name/kebab'  // our custom name transform
  ]
});

/* ---------- 3.  DARK THEME FORMATTER  ------------------------------------ */
StyleDictionary.registerFormat({
  name: 'duck/css/dark',
  formatter: ({ dictionary }) =>
    `[data-theme="dark"] {\n${dictionary.allProperties
      .map(t => `  --${t.name}: ${t.value};`)
      .join('\n')}\n}`
});

/* ---------- 4.  EXPORT CONFIG  ------------------------------------------- */
module.exports = {
  /* ONLY load the dark-mode file so there are no collisions */
  source: ['tokens/dark.json'],

  platforms: {
    css: {
      transformGroup: 'duck/css',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens-dark.css',
          format: 'duck/css/dark'
        }
      ]
    }
  }
};
