import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PrimaryHeader from './primary-header';

class Upsell extends Component {
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
					<span>{ translate( 'You do not have any available Quick Start sessions.' ) }</span>
				</CompactCard>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( Upsell ) );
