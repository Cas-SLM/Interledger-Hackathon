# Interledger documentation design system

Interledger uses Starlight (powered by Astro) for all its documentation sites. We have 2 visual themes for now, teal and orange. These themes are built on top of Starlight's defaults and overrides some of the out-of-the-box styling. They are just CSS files, so use them with the path to `node_modules`. Unfortunately, we did not have enough braincells to figure out how to make it prettier than that. To use them in the `astro.config.mjs`:

```mjs
export default defineConfig({
  integrations: [
    starlight({
      customCss: [
        "./node_modules/@interledger/docs-design-system/src/styles/teal-theme.css",
        "./node_modules/@interledger/docs-design-system/src/styles/ilf-docs.css",
      ],
    }),
  ],
});
```

If you are using them in an Astro layout file, then the import would look like this for the build to not fail:

```
import '/node_modules/@interledger/docs-design-system/src/styles/teal-theme.css';
```

We also have a number of documentation-specific helper components that can be imported and used where necessary. For these shared components, if you are using both `CodeBlock` and `Disclosure` on the same page, you can import them both like so:

```jsx
import { CodeBlock, Disclosure } from "@interledger/docs-design-system";
```

For more information about importing things in Javascript, please refer to [import on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

The available shared components are documented at our [documentation style guide](https://interledger.net).

## Contributing

As this is a shared library, it is a dependency for other projects, specifically all Interledger documentation websites. A good way to check who is using this library is via GitHub search: https://github.com/search?q=%22%40interledger%2Fdocs-design-system%22%3A+path%3Apackage.json&type=code.

Our theme does override a number of Starlight defaults, therefore it is inevitable that if the Starlight internals are modified as they continue to release new features, we will have to make the corresponding updates to this library as well, to make sure nothing breaks. The documentation style guide is a good target to determine if the proposed changes you want to make to the library work correctly or not.

The suggested workflow is as follows:

1. Clone both the documentation style guide and this library

```bash
git clone https://github.com/interledger/docs-design-system.git
```

```bash
git clone https://github.com/interledger/docs-styleguide.git
```

2. Make the documentation style guide read from the local version of the docs-design-system library by modifying the package.json. This will depend on the file structure of your local machine but it would look something like this:

```json
"dependencies": {
    "@interledger/docs-design-system": "../docs-design-system",
}
```

3. After you're done with your changes and have tested that all is well, feel free to make a pull request and it will get reviewed, and hopefully merged into the source code. The version will get bumped and all the sites will have to make an update to their dependencies as well.
