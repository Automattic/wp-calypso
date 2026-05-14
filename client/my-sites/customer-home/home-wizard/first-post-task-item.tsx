import page from '@automattic/calypso-router';
import {
	Icon,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalItem as Item,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { border, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { savePost } from 'calypso/state/posts/actions/save-post';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from './wizard-state';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
	itemClassName: string;
};

function escapeHtml( text: string ): string {
	return text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

/**
 * Convert plain paragraphs to Gutenberg block markup so the editor parses
 * them as proper paragraph blocks instead of one HTML lump.
 */
function paragraphsToBlockMarkup( paragraphs: string[] ): string {
	return paragraphs
		.map(
			( paragraph ) =>
				`<!-- wp:paragraph -->\n<p>${ escapeHtml( paragraph ) }</p>\n<!-- /wp:paragraph -->`
		)
		.join( '\n\n' );
}

/**
 * Tailored Launchpad row for "Publish your first post". When Dolly's
 * starter draft is cached in preferences, clicking the row creates a real
 * wpcom draft pre-populated with the title + paragraphs, then routes to
 * its editor. The user lands on a draft instead of a blank page.
 *
 * If the draft preference is missing (Dolly hadn't returned, errored, or
 * the user finished the wizard before this feature shipped), the row
 * silently falls back to the existing direct link to a blank editor.
 */
export default function FirstPostTaskItem( { task, itemClassName }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const draft =
		(
			useSelector( ( state: AppState ) =>
				getPreference( state, HOME_WIZARD_STATE_PREF )
			) as HomeWizardState | null
		 )?.firstPostDraft ?? null;
	const [ isCreating, setIsCreating ] = useState< boolean >( false );

	const hasUsableDraft =
		!! draft &&
		typeof draft.title === 'string' &&
		Array.isArray( draft.paragraphs ) &&
		draft.paragraphs.length > 0;

	// When Dolly returned a draft, the task row is no longer "publish your
	// first post" generically — it's a specific draft Dolly wrote, ready to
	// open. Reframe the row: title becomes the action ("Draft your first
	// post"), subtitle is Dolly's verb-led description of what publishing
	// the draft does for the user (falls back to the draft's post title for
	// older cached drafts that don't have a subtitle).
	const displayTitle = hasUsableDraft
		? ( translate( 'Draft your first post' ) as string )
		: task.title;
	const displaySubtitle = hasUsableDraft && draft ? draft.subtitle ?? draft.title : task.subtitle;

	const renderRowContents = ( trailing: React.ReactNode ) => (
		<HStack alignment="center" spacing={ 3 }>
			<span className="tailored-launchpad__check" aria-hidden="true">
				<Icon icon={ border } size={ 24 } />
			</span>
			<VStack spacing={ 0 } className="tailored-launchpad__body">
				<span className="tailored-launchpad__title">{ displayTitle }</span>
				{ displaySubtitle && (
					<Text variant="muted" size={ 12 }>
						{ displaySubtitle }
					</Text>
				) }
			</VStack>
			<Spacer />
			{ trailing }
		</HStack>
	);

	// No draft yet → behave exactly like the default row: a plain link to a
	// blank editor. This keeps every fallback path (Dolly slow, errored,
	// pre-feature wizard finish) working without surprise.
	if ( ! hasUsableDraft || ! siteId ) {
		return (
			<Item
				className={ itemClassName + ' tailored-launchpad__row' }
				as="a"
				href={ task.resolvedUrl }
				aria-label={ task.title }
			>
				{ renderRowContents(
					<span className="tailored-launchpad__chevron" aria-hidden="true">
						<Icon icon={ chevronRight } size={ 20 } />
					</span>
				) }
			</Item>
		);
	}

	const onClick = async ( event: React.MouseEvent ) => {
		event.preventDefault();
		if ( isCreating ) {
			return;
		}
		setIsCreating( true );
		try {
			const content = paragraphsToBlockMarkup( draft!.paragraphs );
			const savedPost = ( await dispatch(
				savePost( siteId, null, {
					title: draft!.title,
					content,
					status: 'draft',
				} )
				// `savePost` is a thunk that resolves to the API response —
				// typings don't propagate that fully, so cast the await result.
			) ) as unknown as { ID?: number };
			if ( savedPost?.ID ) {
				page( `/post/${ siteSlug }/${ savedPost.ID }` );
				return;
			}
			// API returned no ID — drop to a blank editor so the user isn't stranded.
			page( task.resolvedUrl );
		} catch ( error ) {
			window.console?.warn?.( '[Launchpad] failed to create starter draft:', error );
			page( task.resolvedUrl );
		} finally {
			setIsCreating( false );
		}
	};

	return (
		<Item
			as="button"
			type="button"
			onClick={ onClick }
			disabled={ isCreating }
			className={ itemClassName + ' tailored-launchpad__row' }
			aria-label={ task.title }
		>
			{ renderRowContents(
				isCreating ? (
					<Spinner />
				) : (
					<span className="tailored-launchpad__chevron" aria-hidden="true">
						<Icon icon={ chevronRight } size={ 20 } />
					</span>
				)
			) }
		</Item>
	);
}
