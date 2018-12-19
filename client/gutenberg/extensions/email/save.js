/**
 * Internal dependencies
 */
import textMatchReplace from 'gutenberg/extensions/presets/jetpack/utils/text-match-replace';

const renderEmail = inputText => {
	return textMatchReplace(
		inputText,
		/((?:[a-z|0-9+_](?:\.|_\+)*)+[a-z|0-9]\@(?:[a-z|0-9])+(?:(?:\.){0,1}[a-z|0-9]){2}\.[a-z]{2,22})/gim,
		( email, i ) => (
			<a href={ `mailto:${ email }` } key={ i } itemprop="email">
				{ email }
			</a>
		)
	);
};

const save = ( { attributes: { email }, className } ) => (
	<div className={ className }>{ renderEmail( email ) }</div>
);

export default save;
