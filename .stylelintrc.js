module.exports = {
  extends: [
    'stylelint-config-twbs-bootstrap/css',
    'stylelint-prettier/recommended',
  ],
  rules: {
    'alpha-value-notation': 'number',
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested'],
        ignore: ['after-comment'],
        ignoreAtRules: ['else'],
      },
    ],
    'comment-empty-line-before': null,
    'declaration-block-no-redundant-longhand-properties': true,
    'declaration-empty-line-before': [
      'always',
      {
        except: ['after-declaration', 'first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'function-calc-no-invalid': true,
    'hue-degree-notation': 'angle',
    'no-empty-source': null,
    'order/order': [
      [
        'custom-properties',
        'declarations',
        {
          type: 'at-rule',
          hasBlock: true,
        },
        'rules',
      ],
    ],
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'selector-class-pattern': null,
  },
}
