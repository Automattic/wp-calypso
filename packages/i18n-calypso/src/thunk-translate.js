/**
 * External dependencies
 */
import { useState, useEffect } from 'react';

/*
 * The idea here is that we offer a function for developers that want to list
 * off a bunch of localized stings in a decalarative format (i.e. outside of a
 * react components)
 *
 * This function would return a react component ready to be rendered as though
 * it were just a string, but with the hooks in place to rerender when i18n
 * changes.
 *
 * ```
 * const myStrings = [
 *  thunk.translate( 'String1', { comment: 'other i18n options go here' } ),
 *  thunk.translate( 'String2' ),
 *  thunk.translate( 'String3' ),
 *
 * render() {
 *   const String0 = myStrings[0];
 *   return <div><String0 /></div>;
 * }
 *
 * This may also let React avoid re-rendering the parent in some cases.
 *
 * It's possible to iterate too. This seems pretty niche, but we can add
 * syntacic sugar if it's something we actually want to do:
 * `createElement( Fragment, null, ...( myStrings.map( createElement ) )`
 *
 * In the somewhat unusual event that your arguments depend on the i18n module
 * itself, you can thunk the arguments to translate as well:
 * Translation thunk.translate(
 *   'The current locale is $(lang)s',
 *   { args: { lang: i18n.getLocaleSlug() } }
 * );
 *
 *
 */
const resolve = f => ( typeof f === 'function' ? f() : f );

export default i18n => ( ...translationArgs ) => () => {
	const [ translation, setTranslation ] = useState(
		// eslint-disable-next-line wpcalypso/i18n-no-variables
		i18n.translate( ...translationArgs.map( resolve ) )
	);

	useEffect( () => {
		const onChange = () => {
			setTranslation(
				// eslint-disable-next-line wpcalypso/i18n-no-variables
				i18n.translate( ...translationArgs.map( resolve ) )
				// 'bob'
			);
		};
		i18n.on( 'change', onChange );
		return () => {
			i18n.off( 'change', onChange );
		};
	}, [] );

	return translation;
};
