import { CompactCard, Gridicon } from '@automattic/components';
import { useTemplate } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import InfoPopover from 'calypso/components/info-popover';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import { addQueryArgs } from 'calypso/lib/route';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { setPreviewUrl } from 'calypso/state/ui/preview/actions';
import Placeholder from '../placeholder';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

interface Props {
	site: SiteDetails;
	id: string;
	type: string;
	title: string;
	description?: string;
	previewUrl?: string;
	isHomepage?: boolean;

	isAdmin: boolean;
	recordGoogleEvent: any;
	recordTracksEvent: any;
	setPreviewUrl: any;
	setLayoutFocus: any;
	infoNotice: any;
}

const VirtualPage = ( {
	site,
	id,
	type,
	title,
	description,
	previewUrl,
	isHomepage,
	isAdmin,
	...props
}: Props ) => {
	const translate = useTranslate();
	const defaultEditorUrl = `/site-editor/${ site.slug }`;
	const editorUrl = ! isHomepage
		? addQueryArgs( { templateId: id, templateType: type }, defaultEditorUrl )
		: defaultEditorUrl;

	const { data: template } = useTemplate( site.ID, id );

	const recordGoogleEvent = ( action: string ) => {
		props.recordGoogleEvent( 'Pages', action );
	};

	const toggleEllipsisMenu = ( isVisible: boolean ) => {
		if ( isVisible ) {
			props.recordTracksEvent( 'calypso_pages_ellipsismenu_open_click', {
				page_type: 'virtual',
				blog_id: site.ID,
			} );
			props.recordGoogleEvent( 'Pages', 'Clicked More Options Menu' );
		}
	};

	const recordEllipsisMenuItemClickEvent = ( item: string ) => {
		props.recordTracksEvent( 'calypso_pages_ellipsismenu_item_click', {
			page_type: 'virtual',
			blog_id: site.ID,
			item,
		} );
	};

	const clickPageTitle = () => {
		props.recordTracksEvent( 'calypso_pages_page_title_click', {
			page_type: 'virtual',
			blog_id: site.ID,
		} );
	};

	const editPage = () => {
		recordEllipsisMenuItemClickEvent( 'editpage' );
		recordGoogleEvent( 'Clicked Edit Page' );
	};

	const viewPage = () => {
		recordEllipsisMenuItemClickEvent( 'viewpage' );
		recordGoogleEvent( 'Clicked View Page' );

		props.setPreviewUrl( previewUrl );
		props.setLayoutFocus( 'preview' );
	};

	const copyPageLink = () => {
		props.infoNotice( translate( 'Link copied to clipboard.' ), {
			duration: 3000,
		} );
		recordEllipsisMenuItemClickEvent( 'copylink' );
		props.recordGoogleEvent( 'Pages', 'Clicked Copy Page Link' );
	};

	if ( ! template ) {
		return <Placeholder.Page key={ id } multisite={ ! site } />;
	}

	return (
		<CompactCard key={ id } className="page is-virtual">
			{ isHomepage && <Gridicon icon="house" size={ 16 } className="page__icon" /> }
			<div className="page__main">
				<a
					className="page__title"
					href={ isAdmin ? editorUrl : site.URL }
					title={
						isAdmin
							? translate( 'Edit %(title)s', { textOnly: true, args: { title } } )
							: translate( 'View %(title)s', { textOnly: true, args: { title } } )
					}
					onClick={ clickPageTitle }
				>
					<span>{ title }</span>
					{ isHomepage && (
						<InfoPopover position="right">
							{ translate(
								'The homepage of your site displays the %(title)s template. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
								{
									args: { title: decodeEntities( template.title.rendered || template.slug ) },
									components: {
										learnMoreLink: (
											<ExternalLink
												href={ localizeUrl(
													'https://wordpress.com/support/templates/#template-hierarchy'
												) }
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</InfoPopover>
					) }
				</a>
				<div className="page-card-info">
					{ description && <span className="page-card-info__description">{ description }</span> }
				</div>
			</div>
			<EllipsisMenu position="bottom left" onToggle={ toggleEllipsisMenu }>
				{ isAdmin && (
					<PopoverMenuItem onClick={ editPage } href={ editorUrl }>
						<Gridicon icon="pencil" size={ 18 } />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
				) }
				{ previewUrl && (
					<PopoverMenuItem onClick={ viewPage }>
						<Gridicon icon="visible" size={ 18 } />
						{ translate( 'View page' ) }
					</PopoverMenuItem>
				) }
				{ previewUrl && (
					// @ts-expect-error The `className` property is not required
					<PopoverMenuItemClipboard text={ previewUrl } onCopy={ copyPageLink } icon="link">
						{ translate( 'Copy link' ) }
					</PopoverMenuItemClipboard>
				) }
			</EllipsisMenu>
		</CompactCard>
	);
};

const mapStateToProps = ( state: any, ownProps: Props ) => {
	return {
		isAdmin: canCurrentUser( state, ownProps.site.ID, 'manage_options' ),
	};
};

const mapDispatchToProps = {
	recordGoogleEvent,
	recordTracksEvent,
	setPreviewUrl,
	setLayoutFocus,
	infoNotice,
};

export default connect( mapStateToProps, mapDispatchToProps )( VirtualPage );
