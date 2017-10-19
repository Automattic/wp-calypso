/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ViewersData from 'components/data/viewers-data';
import Viewers from './viewers';

const ViewersList = React.createClass( {
	displayName: 'ViewersList',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<ViewersData
				site={ this.props.site }
				siteId={ this.props.site.ID }
				label={ this.props.label }
			>
				<Viewers />
			</ViewersData>
		);
	},
} );

export default localize( ViewersList );
