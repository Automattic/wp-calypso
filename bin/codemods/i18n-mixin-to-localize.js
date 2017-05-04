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
      root.find(j.ImportDeclaration).at(0).insertBefore('import { localize } from \'i18n-calypso\';');
    }
  } );

  return root
    .toSource({
      useTabs: true
    });
}
