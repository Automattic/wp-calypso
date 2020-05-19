/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import { Dialog } from '@automattic/components';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import Tooltip from 'components/tooltip';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { getSite } from 'state/sites/selectors';
import { decodeEntities } from 'lib/formatting';
import { deleteTerm } from 'state/terms/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { recordGoogleEvent, bumpStat } from 'state/analytics/actions';
import PodcastIndicator from 'components/podcast-indicator';
import getPodcastingCategoryId from 'state/selectors/get-podcasting-category-id';

class TaxonomyManagerListItem extends Component {
	static propTypes = {
		canSetAsDefault: PropTypes.bool,
		deleteTerm: PropTypes.func,
		isDefault: PropTypes.bool,
		onClick: PropTypes.func,
		saveSiteSettings: PropTypes.func,
		siteId: PropTypes.number,
		term: PropTypes.object,
		translate: PropTypes.func,
		siteUrl: PropTypes.string,
		slug: PropTypes.string,
		isPreviewable: PropTypes.bool,
		recordGoogleEvent: PropTypes.func,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	state = {
		showDeleteDialog: false,
		showTooltip: false,
	};

	deleteItem = () => {
		this.setState( {
			showDeleteDialog: true,
		} );
	};

	viewPosts = () => {
		const { siteSlug, taxonomy: rawTaxonomy, term } = this.props;
		const taxonomy = rawTaxonomy === 'post_tag' ? 'tag' : rawTaxonomy;

		this.props.recordGoogleEvent( 'Taxonomy Manager', `View ${ rawTaxonomy }` );
		page( `/posts/${ siteSlug }?${ taxonomy }=${ term.slug }` );
	};

	closeDeleteDialog = ( action ) => {
		if ( action === 'delete' ) {
			const { siteId, taxonomy, term } = this.props;
			this.props.recordGoogleEvent( 'Taxonomy Manager', `Deleted ${ taxonomy }` );
			this.props.bumpStat( 'taxonomy_manager', `delete_${ taxonomy }` );
			this.props.deleteTerm( siteId, taxonomy, term.ID, term.slug );
		}
		this.setState( {
			showDeleteDialog: false,
		} );
	};

	setAsDefault = () => {
		const { canSetAsDefault, siteId, term } = this.props;
		if ( canSetAsDefault ) {
			this.props.recordGoogleEvent( 'Taxonomy Manager', 'Set Default Category' );
			this.props.bumpStat( 'taxonomy_manager', 'set_default_category' );
			this.props.saveSiteSettings( siteId, { default_category: term.ID } );
		}
	};

	getTaxonomyLink() {
		const { taxonomy, siteUrl, term } = this.props;
		let taxonomyBase = taxonomy;

		if ( taxonomy === 'post_tag' ) {
			taxonomyBase = 'tag';
		}
		return `${ siteUrl }/${ taxonomyBase }/${ term.slug }/`;
	}

	tooltipText = () => {
		const { term, translate } = this.props;
		const name = this.getName();
		const postCount = get( term, 'post_count', 0 );
		return translate( "%(postCount)d '%(name)s' post", "%(postCount)d '%(name)s' posts", {
			count: postCount,
			args: {
				postCount,
				name,
			},
		} );
	};

	showTooltip = () => {
		this.setState( { showTooltip: true } );
	};

	hideTooltip = () => {
		this.setState( { showTooltip: false } );
	};

	getName = () => {
		const { term, translate } = this.props;
		return decodeEntities( term.name ) || translate( 'Untitled' );
	};

	render() {
		const {
			canSetAsDefault,
			isDefault,
			onClick,
			term,
			isPodcastingCategory,
			translate,
		} = this.props;
		const name = this.getName();
		const hasPosts = get( term, 'post_count', 0 ) > 0;
		const className = classNames( 'taxonomy-manager__item', {
			'is-default': isDefault,
		} );
		const deleteDialogButtons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'OK' ), isPrimary: true },
		];

		return (
			<div className={ className }>
				<span className="taxonomy-manager__icon" onClick={ onClick }>
					<Gridicon icon={ isDefault ? 'checkmark-circle' : 'folder' } />
				</span>
				{ /* FIXME: jsx-a11y issues */ }
				{ /* eslint-disable-next-line */ }
				<span className="taxonomy-manager__label" onClick={ onClick }>
					<span>{ name }</span>
					{ isDefault && (
						<span className="taxonomy-manager__default-label">
							{ translate( 'default', { context: 'label for terms marked as default' } ) }
						</span>
					) }
					{ isPodcastingCategory && (
						<PodcastIndicator className="taxonomy-manager__podcast-indicator" />
					) }
				</span>
				{ ! isUndefined( term.post_count ) && (
					<Count
						ref="count"
						count={ term.post_count }
						onMouseEnter={ this.showTooltip }
						onMouseLeave={ this.hideTooltip }
					/>
				) }
				<Tooltip
					context={ this.refs && this.refs.count }
					isVisible={ this.state.showTooltip }
					position="left"
				>
					{ this.tooltipText() }
				</Tooltip>
				<EllipsisMenu position="bottom left">
					<PopoverMenuItem onClick={ onClick }>
						<Gridicon icon="pencil" size={ 18 } />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					{ ( ! canSetAsDefault || ! isDefault ) && (
						<PopoverMenuItem onClick={ this.deleteItem } icon="trash">
							{ translate( 'Delete' ) }
						</PopoverMenuItem>
					) }
					{ hasPosts && (
						<PopoverMenuItem onClick={ this.viewPosts } icon="visible">
							{ translate( 'View Posts' ) }
						</PopoverMenuItem>
					) }
					{ canSetAsDefault && ! isDefault && <PopoverMenuSeparator /> }
					{ canSetAsDefault && ! isDefault && (
						<PopoverMenuItem onClick={ this.setAsDefault } icon="checkmark-circle">
							{ translate( 'Set as default' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
				<Dialog
					isVisible={ this.state.showDeleteDialog }
					buttons={ deleteDialogButtons }
					onClose={ this.closeDeleteDialog }
				>
					<p>
						{ translate( "Are you sure you want to permanently delete '%(name)s'?", {
							args: { name },
						} ) }
					</p>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state, { taxonomy, term } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSite( state, siteId );
		const siteSettings = getSiteSettings( state, siteId );
		const canSetAsDefault = taxonomy === 'category';
		const isDefault = canSetAsDefault && get( siteSettings, [ 'default_category' ] ) === term.ID;
		const isPreviewable = get( site, 'is_previewable' );
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const isPodcastingCategory =
			taxonomy === 'category' && getPodcastingCategoryId( state, siteId ) === term.ID;

		return {
			canSetAsDefault,
			isDefault,
			isPreviewable,
			siteId,
			siteSlug,
			siteUrl,
			isPodcastingCategory,
		};
	},
	{
		deleteTerm,
		saveSiteSettings,
		recordGoogleEvent,
		bumpStat,
	}
)( localize( TaxonomyManagerListItem ) );
