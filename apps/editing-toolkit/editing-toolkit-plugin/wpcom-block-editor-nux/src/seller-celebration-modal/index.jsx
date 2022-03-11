import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import useHasSeenSellerCelebrationModal from '../../../dotcom-fse/lib/seller-celebration-modal/use-has-seen-seller-celebration-modal';
import useSiteIntent from '../../../dotcom-fse/lib/site-intent/use-site-intent';
import NuxModal from '../nux-modal';
import contentSubmittedImage from './images/product-published.svg';
import './style.scss';

/**
 * Show the seller celebration modal
 */
const SellerCelebrationModal = () => {
	const { addEntities } = useDispatch( 'core' );

	useEffect( () => {
		// @TODO - not sure if I actually need this; need to test with it removed.
		// Teach core data about the status entity so we can use selectors like `getEntityRecords()`
		addEntities( [
			{
				baseURL: '/wp/v2/statuses',
				key: 'slug',
				kind: 'root',
				name: 'status',
				plural: 'statuses',
			},
		] );
		// Only register entity once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	// conditions to show:
	// - user just finished saving (check)
	// - editor has not yet displayed modal once (check)
	// - user is a seller (check)
	// - user has not saved site before
	// - content includes product block (check)
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ hasDisplayedModal, setHasDisplayedModal ] = useState( false );
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ) );
	const previousIsEditorSaving = useRef( false );
	const { isEditorSaving, hasPaymentsBlock, linkUrl } = useSelect( ( select ) => {
		if ( isSiteEditor ) {
			const isSavingSite = select( 'core' ).isSavingEntityRecord( 'root', 'site' );
			const page = select( 'core/edit-site' ).getPage();
			const pageId = parseInt( page?.context?.postId );
			const isSavingEntity = select( 'core' ).isSavingEntityRecord( 'postType', 'page', pageId );
			const pageEntity = select( 'core' ).getEntityRecord( 'postType', 'page', pageId );
			const paymentsBlock =
				pageEntity?.content?.raw?.includes( '<!-- wp:jetpack/recurring-payments -->' ) ?? false;
			return {
				isEditorSaving: isSavingSite || isSavingEntity,
				hasPaymentsBlock: paymentsBlock,
				linkUrl: pageEntity?.link,
			};
		}
		const currentPost = select( 'core/editor' ).getCurrentPost();
		const isSavingEntity = select( 'core' ).isSavingEntityRecord(
			'postType',
			currentPost?.type,
			currentPost?.id
		);
		const globalBlockCount = select( 'core/block-editor' ).getGlobalBlockCount(
			'jetpack/recurring-payments'
		);
		return {
			isEditorSaving: isSavingEntity,
			hasPaymentsBlock: globalBlockCount > 0,
			linkUrl: currentPost.link,
		};
	} );
	const intent = useSiteIntent();
	const {
		hasSeenSellerCelebrationModal,
		updateHasSeenSellerCelebrationModal,
	} = useHasSeenSellerCelebrationModal();

	useEffect( () => {
		if (
			! isEditorSaving &&
			previousIsEditorSaving.current &&
			! hasDisplayedModal &&
			intent === 'sell' &&
			hasPaymentsBlock &&
			! hasSeenSellerCelebrationModal
		) {
			setIsModalOpen( true );
			setHasDisplayedModal( true );
			updateHasSeenSellerCelebrationModal( true );
		}
		previousIsEditorSaving.current = isEditorSaving;
	}, [
		isEditorSaving,
		hasDisplayedModal,
		intent,
		hasPaymentsBlock,
		hasSeenSellerCelebrationModal,
		updateHasSeenSellerCelebrationModal,
	] );

	// if save state has changed and was saving on last render
	// then it has finished saving
	// open modal if content has sell block,

	const closeModal = () => setIsModalOpen( false );
	return (
		<NuxModal
			isOpen={ isModalOpen }
			className="wpcom-site-editor-seller-celebration-modal"
			title={ __( "You've added your first product!", 'full-site-editing' ) }
			description={ __(
				'Preview your product on your site before launching and sharing with others.',
				'full-site-editing'
			) }
			imageSrc={ contentSubmittedImage }
			actionButtons={
				<>
					<Button onClick={ closeModal }>{ __( 'Continue editing', 'full-site-editing' ) }</Button>
					<Button isPrimary href={ linkUrl } target="__blank" rel="noopener noreferrer">
						{ __( 'View your product', 'full-site-editing' ) }
					</Button>
				</>
			}
			onRequestClose={ closeModal }
			onOpen={ () => recordTracksEvent( 'calypso_editor_wpcom_seller_celebration_modal_show' ) }
		/>
	);
};

export default SellerCelebrationModal;
