import { isEnabled } from '@automattic/calypso-config';
import pageRouter from '@automattic/calypso-router';
import { CompactCard, Gridicon } from '@automattic/components';
import { useTemplate } from '@automattic/data-stores';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { hasTranslation } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import InfoPopover from 'calypso/components/info-popover';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import PopoverMenuItemQrCode from 'calypso/components/popover-menu/item-qr-code';
import { addQueryArgs } from 'calypso/lib/route';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { setPreviewUrl } from 'calypso/state/ui/preview/actions';
import Placeholder from '../placeholder';
import type { SiteDetails, Template } from '@automattic/data-stores';
import './style.scss';

interface HomepagePopoverProps {
	isAdmin: boolean;
	template?: Template;
}

const HomepagePopover = ( { isAdmin, template }: HomepagePopoverProps ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const learnMoreLink = (
		<ExternalLink
			href={ localizeUrl( 'https://wordpress.com/support/templates/#template-hierarchy' ) }
			children={ null }
		/>
	);

	let msg = null;
	if ( ! isAdmin ) {
		msg = translate(
			'Administrators can change the content of this page using the Site Editor. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink,
				},
			}
		);
	} else if ( template ) {
		msg = translate(
			'You can change the content of this page by editing the %(templateTitle)s template using the Site Editor. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink,
				},
				args: {
					templateTitle: decodeEntities( template.title.rendered || template.slug ),
				},
			}
		);
	} else if (
		isEnglishLocale ||
		hasTranslation(
			'You can change the content of this page using the Site Editor. {{learnMoreLink}}Learn more{{/learnMoreLink}}.'
		)
	) {
		msg = translate(
			'You can change the content of this page using the Site Editor. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
			{
				components: {
					learnMoreLink,
				},
			}
		);
	} else {
		return null;
	}

	return <InfoPopover position="right">{ msg }</InfoPopover>;
};

interface Props {
	site: SiteDetails;
	id: string;
	type: string;
	title: string;
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

	const { data: template, isInitialLoading } = useTemplate( site.ID, id, {
		enabled: isAdmin && !! id,
	} );

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

	const viewStats = () => {
		recordEllipsisMenuItemClickEvent( 'viewstats' );

		if ( isHomepage ) {
			pageRouter( `/stats/post/0/${ site.slug }` );
		}
	};

	const viewPageQrCode = () => {
		recordEllipsisMenuItemClickEvent( 'qrcode' );
	};

	const copyPageLink = () => {
		props.infoNotice( translate( 'Link copied to clipboard.' ), {
			duration: 3000,
		} );
		recordEllipsisMenuItemClickEvent( 'copylink' );
		props.recordGoogleEvent( 'Pages', 'Clicked Copy Page Link' );
	};

	if ( isAdmin && isInitialLoading ) {
		return <Placeholder.Page key={ id } multisite={ ! site } />;
	}

	return (
		<CompactCard key={ id } className="page is-virtual">
			{ isHomepage && <Gridicon icon="house" size={ 16 } className="page__icon" /> }
			<div className="page__main">
				<a
					className="page__title"
					href={ isAdmin ? editorUrl : previewUrl }
					title={
						isAdmin
							? translate( 'Edit %(title)s', { textOnly: true, args: { title } } )
							: translate( 'View %(title)s', { textOnly: true, args: { title } } )
					}
					onClick={ clickPageTitle }
				>
					<span>{ title }</span>
					{ isHomepage && <HomepagePopover isAdmin={ isAdmin } template={ template } /> }
				</a>
				{ isHomepage && template && (
					<div className="page-card-info">
						<span className="page-card-info__description">
							{ translate( 'Your homepage uses the %(templateTitle)s template', {
								args: { templateTitle: decodeEntities( template.title.rendered || template.slug ) },
							} ) }
						</span>
					</div>
				) }
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
				{ previewUrl && (
					<PopoverMenuItem onClick={ viewStats }>
						<Gridicon icon="stats" size={ 18 } />
						{ translate( 'Stats' ) }
					</PopoverMenuItem>
				) }
				{ previewUrl && isEnabled( 'post-list/qr-code-link' ) && (
					<PopoverMenuItemQrCode url={ previewUrl } handleClick={ viewPageQrCode }>
						{ translate( 'QR Code' ) }
					</PopoverMenuItemQrCode>
				) }
			</EllipsisMenu>
		</CompactCard>
	);
};

const mapStateToProps = ( state: any, ownProps: Props ) => {
	return {
		isAdmin: canCurrentUser( state, ownProps.site.ID, 'edit_theme_options' ),
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
