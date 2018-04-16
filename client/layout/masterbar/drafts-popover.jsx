/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { newPost } from 'lib/paths';
import Popover from 'components/popover';
import Count from 'components/count';
import Draft from 'my-sites/draft';
import Button from 'components/button';
import { getSite } from 'state/sites/selectors';

class MasterbarDraftsPopover extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Popover
				isVisible
				onClose={ this.props.closeDrafts }
				position="bottom left"
				context={ this.props.context }
				className="masterbar__recent-drafts"
			>

				<div className="masterbar__recent-drafts-heading">
					<h3>{ translate( 'Recent Drafts' ) }</h3>

					<Button
						compact
						className="masterbar__recent-drafts-add-new"
						href={ newPost( this.props.site ) }
						onClick={ this.props.newDraftClicked }
					>
						{ translate( 'New Draft' ) }
					</Button>
				</div>

				<div className="masterbar__recent-drafts-list">
					{ this.renderDrafts() }

					{ this.props.loadingDrafts && <Draft isPlaceholder /> }

					<Button
						compact
						borderless
						className="masterbar__recent-drafts-see-all"
						href={ `/posts/drafts/${ this.props.site.slug }` }
						onClick={ this.props.seeAllDraftsClicked }
					>
						{ translate( 'See All' ) }
						{ this.props.draftCount ? <Count count={ this.props.draftCount } /> : null }
					</Button>
				</div>
			</Popover>
		);
	}

	renderDrafts() {
		const { site, drafts } = this.props;

		if ( ! drafts ) {
			return null;
		}

		return drafts.map( draft => (
			<Draft
				key={ draft.global_ID }
				post={ draft }
				siteId={ site.ID }
				showAuthor={ ! site.single_user_site && ! this.props.userId }
				onTitleClick={ this.props.draftClicked }
			/>
		) );
	}
}

export default connect( ( state, { siteId } ) => {
	return {
		site: null,
		drafts: null,
		loadingDrafts: false,
	};
} )( localize( MasterbarDraftsPopover ) );
