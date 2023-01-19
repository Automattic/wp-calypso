# Generator

Generate a sub-package under the Calypso monorepo. See [Working with the Monorepo](https://github.com/Automattic/wp-calypso/blob/trunk/docs/monorepo.md#L1) for more details.

## Usage

Use the following command to run the calypso-package-generator.

```
yarn run generate
```

Now we have 2 generators as below, and the calypso-package-generator will ask you to choose.

* component: Add a new library of React components designed for use in Automattic products.
* library: Add a new library of js designed for use in Automattic products.

### Example

```bash
? [PLOP] Please choose a generator. (Use arrow keys)
❯ component - Add a new library of React components designed for use in Automattic products. 
  library - Add a new library of js designed for use in Automattic products. 

? What should the package be called? ()

? Type a short description ()

? Do you want to publish this package? (Y/n)
```