/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

const ThemeDownloadCard = React.createClass( {

	propTypes: {
		theme: React.PropTypes.string.isRequired,
		href: React.PropTypes.string
	},

	render() {
		// When we don't generate zips, it's because we have released the theme on .org.
		const downloadURI = this.props.href || ( 'https://downloads.wordpress.org/theme/' + this.props.theme + '.zip' );
		const downloadText =
			i18n.translate( 'This theme is available for download to be used on your {{a}}WordPress self-hosted{{/a}} installation.', {
				components: {
					a: <a href={ 'https://wordpress.org' } />
				}
			} );
		return (
			<Card className="theme-download-card">
				<Gridicon icon="cloud-download" size={ 48 } />
				<p>{ downloadText }</p>
				<Button href={ downloadURI }>{ i18n.translate( 'Download' ) }</Button>
			</Card>
		);
	}
} );

module.exports = ThemeDownloadCard;
