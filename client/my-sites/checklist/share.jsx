/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ShareButton from 'components/share-button';
import { recordTracksEvent } from 'state/analytics/actions';

const services = [ 'facebook', 'twitter', 'linkedin', 'pinterest' ];

class ChecklistShowShare extends PureComponent {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		recordTracksEvent: PropTypes.func,
	};

	boundClickHandler = {};

	handleClick( service ) {
		this.props.recordTracksEvent( 'calypso_checklist_completed_site_share', {
			checklist_name: 'new_blog',
			service,
		} );
	}

	getClickHandlerFor( service ) {
		if ( ! this.props.recordTracksEvent ) {
			return;
		}

		if ( ! this.boundClickHandler[ service ] ) {
			this.boundClickHandler[ service ] = () => this.handleClick( service );
		}

		return this.boundClickHandler[ service ];
	}

	render() {
		return (
			<div className={ this.props.className }>
				{ services.map( service => (
					<ShareButton
						key={ service }
						url={ `https://${ this.props.siteSlug }` }
						title="Delighted to announce my new website is live today - please take a look."
						siteSlug={ this.props.siteSlug }
						service={ service }
						onClick={ this.getClickHandlerFor( service ) }
					/>
				) ) }
			</div>
		);
	}
}
export default connect( null, { recordTracksEvent } )( ChecklistShowShare );
