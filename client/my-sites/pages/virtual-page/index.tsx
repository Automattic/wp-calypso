import { CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import InfoPopover from 'calypso/components/info-popover';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import { addQueryArgs } from 'calypso/lib/route';
import { infoNotice } from 'calypso/state/notices/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { setPreviewUrl } from 'calypso/state/ui/preview/actions';
import { recordEvent } from '../helpers';
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
}

const VirtualPage = ( { site, id, type, title, description, previewUrl, isHomepage }: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const decodedTitle = decodeEntities( title );
	const editorUrl = addQueryArgs(
		{ templateId: id, templateType: type },
		`/site-editor/${ site.slug }`
	);

	const handleMenuToggle = ( isVisible: boolean ) => {
		if ( isVisible ) {
			recordEvent( 'Clicked More Options Menu' );
		}
	};

	const recordEditPage = () => recordEvent( 'Clicked Edit Page' );

	const recordViewPage = () => recordEvent( 'Clicked View Page' );

	const viewPage = () => {
		recordViewPage();
		dispatch( setPreviewUrl( previewUrl ) );
		dispatch( setLayoutFocus( 'preview' ) );
	};

	const copyPageLink = () => {
		dispatch(
			infoNotice( translate( 'Link copied to clipboard.' ), {
				duration: 3000,
			} )
		);
		recordEvent( 'Clicked Copy Page Link' );
	};

	return (
		<CompactCard key={ id } className="virtual-page">
			<div className="virtual-page__main">
				<a
					className="virtual-page__title"
					href={ editorUrl }
					title={ translate( 'Edit %(title)s', {
						textOnly: true,
						args: { title: decodedTitle },
					} ) }
				>
					<span>{ decodedTitle }</span>
					{ isHomepage && (
						<InfoPopover position="right">
							{ translate(
								'The homepage of your site displays the Home template. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
								{
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
				<div className="virtual-page__info">
					{ description && <span>{ description }</span> }
					{ isHomepage && (
						<span className="virtual-page__badge">
							<Gridicon icon="house" size={ 12 } className="virtual-page__badge-icon" />
							<span className="virtual-page__badge-text">{ translate( 'Homepage' ) }</span>
						</span>
					) }
				</div>
			</div>
			<EllipsisMenu position="bottom left" onToggle={ handleMenuToggle }>
				<PopoverMenuItem onClick={ recordEditPage } href={ editorUrl }>
					<Gridicon icon="pencil" size={ 18 } />
					{ translate( 'Edit' ) }
				</PopoverMenuItem>
				{ previewUrl && (
					<PopoverMenuItem onClick={ viewPage }>
						<Gridicon icon="visible" size={ 18 } />
						{ translate( 'View page' ) }
					</PopoverMenuItem>
				) }
				{ previewUrl && (
					// @ts-expect-error The `className` property is not required
					<PopoverMenuItemClipboard text={ previewUrl } onCopy={ copyPageLink } icon={ 'link' }>
						{ translate( 'Copy link' ) }
					</PopoverMenuItemClipboard>
				) }
			</EllipsisMenu>
		</CompactCard>
	);
};

export default VirtualPage;
