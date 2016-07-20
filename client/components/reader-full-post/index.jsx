/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import StickyPanel from 'components/sticky-panel';
import Gridicon from 'components/gridicon';
import { setSection } from 'state/ui/actions';

export class FullPostView extends React.Component {

	componentWillMount() {

	}

	render() {
		return (
			<Main className="reader-full-post">
				<StickyPanel>
					<div className="reader-full-post__back">
						<Gridicon icon="arrow-left" />
					{ translate( 'Back' ) }
					</div>
				</StickyPanel>
				Reader full post
			</Main>
		);
	}
}

/**
 * A container for the FullPostView responsible for binding to Flux stores
 */
export class FullPostFluxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
	}

	getStateFromStores( props = this.props ) {
		return {
			post: null,
			site: null,
			feed: null
		};
	}

	componentWillMount() {
		// false won't change the section, we just want to remove the sidebar
		// We can't remove the sidebar the usual way, by using a section in the section config,
		// because full post lives at a dynamic path whose prefix is shared by sections that may want a sidebar
		//
		// if we decide to remove the sidebar on site / feed listings, then we _can_ use a section, but we'll have
		// to make secondary dependant on the feature flag...
		this.props.setSection( false, { hasSidebar: false } );
	}

	componentWillReceiveProps( nextProps ) {

	}

	componentWillUnmount() {

	}

	render() {
		return <FullPostView post={ this.state.post } site={ this.state.site } feed={ this.state.feed } />;
	}
}

export default connect(
	state => {
		return { post: { ID: 1 } };
	},
	dispatch => {
		return bindActionCreators( {
			setSection
		}, dispatch );
	}
)( FullPostFluxContainer );
