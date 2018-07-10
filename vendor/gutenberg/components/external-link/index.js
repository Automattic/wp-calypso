/**
 * External dependencies
 */
import classnames from 'classnames';
import { compact, uniq } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Dashicon from '../dashicon';
import './style.scss';

function ExternalLink( { href, children, className, rel = '', ...additionalProps } ) {
	rel = uniq( compact( [
		...rel.split( ' ' ),
		'external',
		'noreferrer',
		'noopener',
	] ) ).join( ' ' );
	const classes = classnames( 'components-external-link', className );
	return (
		<a { ...additionalProps } className={ classes } href={ href } target="_blank" rel={ rel }>
			{ children }
			<span className="screen-reader-text">
				{
					/* translators: accessibility text */
					__( '(opens in a new window)' )
				}
			</span>
			<Dashicon icon="external" />
		</a>
	);
}

export default ExternalLink;
