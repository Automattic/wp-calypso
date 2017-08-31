/**
 * External dependencies
 */
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import ZoneDetailsForm from '../../forms/zone-details-form';
import ZoneContentForm from '../../forms/zone-content-form';
import { settingsPath } from '../../../app/util';

class Zone extends Component {

	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	}

	render() {
		const { siteId, siteSlug, translate } = this.props;

		return (
			<div>
				<HeaderCake
					backHref={ `${ settingsPath }/${ siteSlug }` }
					actionButton={ <Button compact primary scary>{ translate( 'Delete' ) }</Button> } >
					{ translate( 'Edit zone' ) }
				</HeaderCake>

				<ZoneDetailsForm label={ translate( 'Zone label' ) } siteId={ siteId } onSubmit={ noop } />

				<ZoneContentForm label={ translate( 'Zone content' ) } siteId={ siteId } onSubmit={ noop } />
			</div>
		);
	}
}

const connectComponent = connect( state => ( {
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight(
	connectComponent,
	localize,
)( Zone );
