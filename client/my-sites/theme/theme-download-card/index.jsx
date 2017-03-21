/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

class ThemeDownloadCard extends React.Component {

	static propTypes = {
		href: React.PropTypes.string
	}

	render() {
		const { href } = this.props;

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
				<Button href={ href }>{ i18n.translate( 'Download' ) }</Button>
			</Card>
		);
	}
}

module.exports = ThemeDownloadCard;
