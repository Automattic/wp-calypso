export default function transformer(file, api) {
  const j = api.jscodeshift;
  const ReactUtils = require('react-codemod/transforms/utils/ReactUtils')(j);
  const root = j(file.source);

  const createClassesInstances = ReactUtils.findAllReactCreateClassCalls( root );

  createClassesInstances.forEach( createClassInstance => {
    const thisTranslateInstances = j(createClassInstance).find(j.MemberExpression, {
      object: { type: 'ThisExpression'},
      property: {
        type: 'Identifier',
        name: 'translate'
      }
    });
    thisTranslateInstances.replaceWith( () => (
      j.memberExpression(
        j.memberExpression(
          j.thisExpression(),
          j.identifier('props')
        ),
        j.identifier('translate')
      )
    ) );
    if (thisTranslateInstances.size()) {
      j(createClassInstance).replaceWith( () => (
        j.callExpression(
          j.identifier('localize'),
          [ createClassInstance.value ]
        )
      ));

      const i18nCalypsoImports = root.find(j.ImportDeclaration, {
        source: { value: 'i18n-calypso' }
      })
      if ( i18nCalypsoImports.size() ) {
        const i18nCalypsoImport = i18nCalypsoImports.get();
        const localizeImport = j(i18nCalypsoImport).find(j.ImportSpecifier, {
          local: {
            type: 'Identifier',
            name: 'localize'
          }
        });
        if ( ! localizeImport.size() ) {
          i18nCalypsoImport.value.specifiers.push( j.importSpecifier(
            j.identifier('localize')
          ));
        }
      } else {
        root.find(j.ImportDeclaration).at(0).insertAfter('import { localize } from \'i18n-calypso\';');
      }
    }
  } );

  return root
    .toSource({
      useTabs: true
    });
}
