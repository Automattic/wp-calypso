/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import ZoneDetailsForm from '../../forms/zone-details-form';
import { addZone } from '../../../state/zones/actions';
import { settingsPath } from '../../../app/util';

class ZoneCreator extends PureComponent {
	static propTypes = {
		addZone: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	save = ( form, data ) => this.props.addZone( this.props.siteId, form, data );

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<div>
				<HeaderCake backHref={ `${ settingsPath }/${ siteSlug }` }>
					{ translate( 'Add a zone' ) }
				</HeaderCake>

				<ZoneDetailsForm label={ translate( 'New zone' ) } onSubmit={ this.save } />
			</div>
		);
	}
}

const connectComponent = connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ addZone }
);

export default flowRight( connectComponent, localize )( ZoneCreator );
