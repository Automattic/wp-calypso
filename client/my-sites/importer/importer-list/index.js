/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flow, get, identity, includes, map } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { appStates } from 'state/imports/constants';
import { getSelectedSite } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import ImporterLogo from 'my-sites/importer/importer-logo';
import StartButton from 'my-sites/importer/importer-header/start-button';
import ImporterListItem from './item';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ];

class ImporterList extends React.PureComponent {
	static displayName = 'ImporterList';

	static propTypes = {
		importers: PropTypes.arrayOf(
			PropTypes.shape( {
				title: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
				icon: PropTypes.string,
				description: PropTypes.string,
			} )
		),
		// site:
	};

	static defaultProps = {
		translate: identity,
		importers: [],
	}

	render() {
		const { importers, site, translate } = this.props;
		const adminUrl = get( site, 'options.admin_url' );

		return (
			<div>
				<ul>
					{ map(
						importers,
						( { description, icon, title, type } ) => (
							<ImporterListItem
								title={ title }
								type={ type }
								icon={ icon }
								description={ description }
								key={ type }
							/>
						)
					) }
				</ul>
				{ adminUrl && (
					<CompactCard
						key="other-importers-card"
						href={ adminUrl + 'import.php' }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ translate( 'Other importers' ) }
					</CompactCard>
				) }
			</div>
		);
	}
}

export default flow(
	connect(
		state => ( {
			site: getSelectedSite( state ),
		} )
	),
	localize
)( ImporterList );
