/**
 * This codeshift takes all of the imports for a file, and organizes them into two sections:
 * External dependencies and Internal Dependencies.
 *
 * It is smart enough to retain whether or not a docblock should keep a prettier/formatter pragma
 */
const fs = require("fs");
const _ = require("lodash");
const config = require("./config");

/**
 * Gather all of the external deps and throw them in a set
 */
const nodeJsDeps = require("repl")._builtinLibs;
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const packageJsonDeps = []
  .concat(nodeJsDeps)
  .concat(Object.keys(packageJson.dependencies))
  .concat(Object.keys(packageJson.devDependencies));

const externalDependenciesSet = new Set(packageJsonDeps);

const externalBlock = {
  type: "Block",
  value: "*\n * External dependencies\n "
};
const internalBlock = {
  type: "Block",
  value: "*\n * Internal dependencies\n "
};

/**
 * Returns true if the given text contains @format.
 * within its first docblock. False otherwise.
 *
 * @param {String} text text to scan for the format keyword within the first docblock
 */
const shouldFormat = text => {
  const firstDocBlockStartIndex = text.indexOf("/**");

  if (-1 === firstDocBlockStartIndex) {
    return false;
  }

  const firstDocBlockEndIndex = text.indexOf("*/", firstDocBlockStartIndex + 1);

  if (-1 === firstDocBlockEndIndex) {
    return false;
  }

  const firstDocBlockText = text.substring(
    firstDocBlockStartIndex,
    firstDocBlockEndIndex + 1
  );
  return firstDocBlockText.indexOf("@format") >= 0;
};

/**
 * Removes the extra newlines between two import statements
 */
const removeExtraNewlines = str =>
  str.replace(/(import.*\n)\n+(import)/g, "$1$2");

/**
 * Adds a newline in between the last import of external deps + the internal deps docblock
 */
const addNewlineBeforeDocBlock = str =>
  str.replace(/(import.*\n)(\/\*\*)/, "$1\n$2");
const isExternal = importNode =>
  externalDependenciesSet.has(importNode.source.value.split("/")[0]);

/**
 *
 * @param {Array} importNodes the import nodes to sort
 * @returns {Array} the sorted set of import nodes
 */
const sortImports = importNodes =>
  _.sortBy(importNodes, node => node.source.value);

module.exports = function(file, api) {
  const j = api.jscodeshift;
  const src = j(file.source);
  const includeFormatBlock = shouldFormat(src.toSource().toString());
  const declarations = src.find(j.ImportDeclaration);

  // if there are no deps at all, then return early.
  if (_.isEmpty(declarations.nodes())) {
    return file.source;
  }

  const withoutComments = declarations.nodes().map(node => {
    node.comments = "";
    return node;
  });

  const externalDeps = sortImports(
    withoutComments.filter(node => isExternal(node))
  );
  const internalDeps = sortImports(
    withoutComments.filter(node => !isExternal(node))
  );

  if (externalDeps[0]) {
    externalDeps[0].comments = [externalBlock];
  }
  if (internalDeps[0]) {
    internalDeps[0].comments = [internalBlock];
  }

  const newDeclarations = []
    .concat(includeFormatBlock && "/** @format */")
    .concat(externalDeps)
    .concat(internalDeps);

  declarations.remove();

  return addNewlineBeforeDocBlock(
    removeExtraNewlines(
      src
        .find(j.Statement)
        .at(0)
        .insertBefore(newDeclarations)
        .toSource(config.recastOptions)
    )
  );
};
