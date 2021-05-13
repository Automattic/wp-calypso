/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

class ThemeDownloadCard extends React.PureComponent {
	static propTypes = {
		href: PropTypes.string,
	};

	render() {
		const { href, translate } = this.props;

		const downloadText = translate(
			'This theme is available for download to be used on your {{a}}WordPress self-hosted{{/a}} installation.',
			{
				components: {
					a: <a href={ 'https://wordpress.org' } />,
				},
			}
		);
		return (
			<Card className="theme-download-card">
				<Gridicon icon="cloud-download" size={ 48 } />
				<p>{ downloadText }</p>
				<Button href={ href }>{ translate( 'Download' ) }</Button>
			</Card>
		);
	}
}

export default localize( ThemeDownloadCard );
