/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { restoreSettings } from '../../state/settings/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRestoringSettings } from '../../state/settings/selectors';

class FixConfig extends Component {
	static propTypes = {
		isReadOnly: PropTypes.bool.isRequired,
		isRestoring: PropTypes.bool.isRequired,
		restoreSettings: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	restoreSettings = () => this.props.restoreSettings( this.props.siteId );

	render() {
		const { isReadOnly, isRestoring, translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Fix Configuration' ) } />
				<Card>
					<Button
						compact
						busy={ isRestoring }
						disabled={ isRestoring || isReadOnly }
						onClick={ this.restoreSettings }
					>
						{ translate( 'Restore Default Configuration' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isRestoring = isRestoringSettings( state, siteId );

		return {
			isRestoring,
			siteId,
		};
	},
	{ restoreSettings }
);

export default flowRight( connectComponent, localize )( FixConfig );
