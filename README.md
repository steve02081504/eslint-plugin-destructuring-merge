# eslint-plugin-destructuring-merge

An ESLint plugin to merge consecutive destructuring assignments from the same object. This rule helps improve code readability and conciseness.

## Supported Rules

### `destructuring-merge`

This rule identifies and merges multiple destructuring assignments from the same object or property into a single declaration.

**Before:**

```javascript
const { a } = obj;
const { b } = obj;

// Or with nested objects
const { c } = req.params;
const { d } = req.params;

// Or from a deeper nested object property
const { foo } = req.cookies.user;
const { bar } = req.cookies.user;
```

**After:**

```javascript
const { a, b } = obj;

// Or with nested objects
const { c, d } = req.params;

// Or from a deeper nested object property
const { foo, bar } = req.cookies.user;
```

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```bash
npm install eslint --save-dev
# or
yarn add eslint --dev
```

Next, install `eslint-plugin-destructuring-merge`:

```bash
npm install eslint-plugin-destructuring-merge --save-dev
# or
yarn add eslint-plugin-destructuring-merge --dev
```

## Usage

Add `destructuring-merge` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "destructuring-merge"
    ]
}
```

Then configure the `destructuring-merge` rule under the rules section.

```json
{
    "rules": {
        "destructuring-merge/destructuring-merge": "warn"
        // or "error" or "off", depending on your preference
    }
}
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/steve02081504/eslint-plugin-destructuring-merge).
