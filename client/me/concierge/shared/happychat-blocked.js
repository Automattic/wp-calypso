import { Button, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PrimaryHeader from './primary-header';

class HappychatBlocked extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_upsell_step' );
	}

	render() {
		const { site, translate } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="shared__site-block">
					<Site siteId={ site.ID } />
				</CompactCard>
				<CompactCard>
					<p>
						{ translate(
							'Quick Start sessions are unavailable to you. If you think this is a mistake, please reach out to us.'
						) }{ ' ' }
					</p>
					<Button href={ `/help/contact` } primary>
						{ translate( 'Contact Support' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( HappychatBlocked ) );
