const StyleDictionary = require('style-dictionary');

/* ---------- 1. PARSER: $value ➜ value ---------- */
StyleDictionary.registerParser({
  pattern: /\.json$/,
  parse: ({ contents }) => {
    const obj = JSON.parse(contents);
    const walk = (node) => {
      if (node && typeof node === 'object') {
        if (node.$value !== undefined) {
          node.value = node.$value;       // make SD recognise the token
          delete node.$value;
        }
        if (node.$type !== undefined) {   // optional: keep type
          node.type = node.$type;
          delete node.$type;
        }
        Object.values(node).forEach(walk);
      }
    };
    walk(obj);
    return obj;
  }
});

/* ---------- 2.  BASIC TRANSFORMS ---------- */
StyleDictionary.registerTransform({
  name: 'duck/name/kebab',
  type: 'name',
  transformer: (token) => token.path.join('-').toLowerCase()
});

StyleDictionary.registerTransformGroup({
  name: 'duck/css',
  transforms: ['attribute/cti', 'duck/name/kebab']  // include core attr transform
});

/* ---------- 3.  OUTPUT FORMAT ---------- */
StyleDictionary.registerFormat({
  name: 'duck/css/light',
  formatter: ({ dictionary }) =>
    `:root {\n${dictionary.allProperties
      .map(t => `  --${t.name}: ${t.value};`)
      .join('\n')}\n}`
});

/* ---------- 4.  CONFIG ---------- */
module.exports = {
  source: ['tokens/light.json'],
  platforms: {
    css: {
      transformGroup: 'duck/css',
      buildPath: 'build/',
      files: [
        {
          destination: 'tokens-light.css',
          format: 'duck/css/light'
        }
      ]
    }
  }
};
