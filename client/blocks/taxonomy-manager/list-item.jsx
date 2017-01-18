/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import Dialog from 'components/dialog';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import Tooltip from 'components/tooltip';
import WithPreviewProps from 'components/web-preview/with-preview-props';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { getSite, isJetpackSite } from 'state/sites/selectors';
import { decodeEntities } from 'lib/formatting';
import { deleteTerm } from 'state/terms/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { recordGoogleEvent, bumpStat } from 'state/analytics/actions';

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
		isJetpack: PropTypes.bool,
		isPreviewable: PropTypes.bool,
		recordGoogleEvent: PropTypes.func,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	state = {
		showDeleteDialog: false,
		showTooltip: false
	};

	deleteItem = () => {
		this.setState( {
			showDeleteDialog: true
		} );
	};

	closeDeleteDialog = action => {
		if ( action === 'delete' ) {
			const { siteId, taxonomy, term } = this.props;
			this.props.recordGoogleEvent( 'Taxonomy Manager', `Deleted ${ taxonomy }` );
			this.props.bumpStat( 'taxonomy_manager', `delete_${ taxonomy }` );
			this.props.deleteTerm( siteId, taxonomy, term.ID, term.slug );
		}
		this.setState( {
			showDeleteDialog: false
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
		return translate(
			'%(postCount)d \'%(name)s\' post',
			'%(postCount)d \'%(name)s\' posts',
			{
				count: postCount,
				args: {
					postCount,
					name
				}
			}
		);
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
		const { canSetAsDefault, isDefault, onClick, term, translate, isJetpack } = this.props;
		const name = this.getName();
		const className = classNames( 'taxonomy-manager__item', {
			'is-default': isDefault
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
				<span className="taxonomy-manager__label" onClick={ onClick }>
					<span>{ name }</span>
					{ isDefault &&
					<span className="taxonomy-manager__default-label">
							{ translate( 'default', { context: 'label for terms marked as default' } ) }
						</span>
					}
				</span>
				{ ! isUndefined( term.post_count ) && <Count
					ref="count"
					count={ term.post_count }
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
				/> }
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
					{ ( ! canSetAsDefault || ! isDefault ) &&
						<PopoverMenuItem onClick={ this.deleteItem } icon="trash">
							{ translate( 'Delete' ) }
						</PopoverMenuItem>
					}
					{ ! isJetpack &&
						<WithPreviewProps
								url={ this.getTaxonomyLink() }
								isPreviewable={ this.props.isPreviewable }>
							{ ( props ) =>
								<PopoverMenuItem { ...props }
										icon={ this.props.isPreviewable
											? 'visible' : 'external' }>
									{ translate( 'View Posts' ) }
								</PopoverMenuItem>
							}
						</WithPreviewProps>
					}
					{ canSetAsDefault && ! isDefault && <PopoverMenuSeparator /> }
					{ canSetAsDefault && ! isDefault &&
						<PopoverMenuItem onClick={ this.setAsDefault } icon="checkmark-circle">
							{ translate( 'Set as default' ) }
						</PopoverMenuItem>
					}
				</EllipsisMenu>
				<Dialog
					isVisible={ this.state.showDeleteDialog }
					buttons={ deleteDialogButtons }
					onClose={ this.closeDeleteDialog }
				>
					<p>{ translate( 'Are you sure you want to permanently delete \'%(name)s\'?', { args: { name } } ) }</p>
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
		const siteUrl = get( site, 'URL' );

		return {
			canSetAsDefault,
			isDefault,
			isJetpack: isJetpackSite( state, siteId ),
			isPreviewable,
			siteId,
			siteUrl,
		};
	},
	{
		deleteTerm,
		saveSiteSettings,
		recordGoogleEvent,
		bumpStat,
	}
)( localize( TaxonomyManagerListItem ) );
