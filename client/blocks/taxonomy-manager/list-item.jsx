import page from '@automattic/calypso-router';
import { Count, Dialog, Gridicon, Tooltip } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PodcastIndicator from 'calypso/components/podcast-indicator';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuSeparator from 'calypso/components/popover-menu/separator';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordGoogleEvent, bumpStat } from 'calypso/state/analytics/actions';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { deleteTerm } from 'calypso/state/terms/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
		recordGoogleEvent: PropTypes.func,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	countRef = createRef();

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
		const { canSetAsDefault, isDefault, onClick, term, isPodcastingCategory, translate } =
			this.props;
		const name = this.getName();
		const hasPosts = get( term, 'post_count', 0 ) > 0;
		const className = clsx( 'taxonomy-manager__item', {
			'is-default': isDefault,
		} );
		const deleteDialogButtons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'OK' ), isPrimary: true },
		];

		const onKeyUp = ( event ) => {
			if ( event.key === 'Enter' ) {
				onClick();
			}
		};

		return (
			<div className={ className }>
				<span
					className="taxonomy-manager__icon"
					role="button"
					tabIndex={ 0 }
					onKeyUp={ onKeyUp }
					onClick={ onClick }
					aria-label={ name }
				>
					<Gridicon icon={ isDefault ? 'checkmark-circle' : 'folder' } />
				</span>
				<span
					className="taxonomy-manager__label"
					role="button"
					tabIndex={ 0 }
					onKeyUp={ onKeyUp }
					onClick={ onClick }
					aria-label={ name }
				>
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
				{ typeof term.post_count !== 'undefined' && (
					<div className="taxonomy-manager__count">
						<Count
							forwardRef={ this.countRef }
							count={ term.post_count }
							onMouseEnter={ this.showTooltip }
							onMouseLeave={ this.hideTooltip }
						/>
					</div>
				) }
				<Tooltip
					context={ this.countRef.current }
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
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const isPodcastingCategory =
			taxonomy === 'category' && getPodcastingCategoryId( state, siteId ) === term.ID;

		return {
			canSetAsDefault,
			isDefault,
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
