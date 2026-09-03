import { Button } from '@wordpress/components';
import { useEffect, useState, useSyncExternalStore } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './style.scss';
import {
	getExternalContextCards,
	subscribeToExternalContext,
	type ExternalContextCard,
	type ExternalContextCardAction,
} from '../../utils/external-context';

interface Props {
	onAction?: ( card: ExternalContextCard, action: ExternalContextCardAction ) => void;
	onDismiss?: ( card: ExternalContextCard ) => void;
}

interface RenderedCard {
	card: ExternalContextCard;
	leaving: boolean;
}

// Keep in sync with $context-card-leave-duration in style.scss.
const LEAVE_DURATION_MS = 220;

export default function ContextCards( { onAction, onDismiss }: Props ) {
	const cards = useSyncExternalStore(
		subscribeToExternalContext,
		getExternalContextCards,
		getExternalContextCards
	);

	const [ rendered, setRendered ] = useState< RenderedCard[] >( () =>
		cards.map( ( card ) => ( { card, leaving: false } ) )
	);

	// Reconcile local render list with the store: keep order, mark removed
	// cards as leaving, append new ones.
	useEffect( () => {
		setRendered( ( prev ) => {
			const incoming = new Map( cards.map( ( card ) => [ card.id, card ] ) );
			const seen = new Set< string >();
			const next: RenderedCard[] = [];

			for ( const entry of prev ) {
				const updated = incoming.get( entry.card.id );
				if ( updated ) {
					next.push( { card: updated, leaving: false } );
					seen.add( entry.card.id );
				} else {
					next.push( { card: entry.card, leaving: true } );
				}
			}

			for ( const card of cards ) {
				if ( ! seen.has( card.id ) ) {
					next.push( { card, leaving: false } );
				}
			}

			return next;
		} );
	}, [ cards ] );

	// Drop leaving cards from the DOM after the transition completes.
	useEffect( () => {
		if ( ! rendered.some( ( entry ) => entry.leaving ) ) {
			return;
		}

		const timer = window.setTimeout( () => {
			setRendered( ( prev ) => prev.filter( ( entry ) => ! entry.leaving ) );
		}, LEAVE_DURATION_MS );

		return () => window.clearTimeout( timer );
	}, [ rendered ] );

	if ( rendered.length === 0 ) {
		return null;
	}

	return (
		<div
			className="agents-manager-context-cards"
			aria-label={ __( 'Chat context', __i18n_text_domain__ ) }
		>
			{ rendered.map( ( { card, leaving } ) => (
				<div
					key={ card.id }
					className={ clsx( 'agents-manager-context-card-wrapper', {
						'agents-manager-context-card-wrapper--leaving': leaving,
					} ) }
					aria-hidden={ leaving || undefined }
				>
					<section className="agents-manager-context-card">
						{ onDismiss && (
							<Button
								className="agents-manager-context-card__dismiss"
								variant="tertiary"
								size="small"
								onClick={ () => onDismiss( card ) }
								aria-label={ __( 'Dismiss context card', __i18n_text_domain__ ) }
								disabled={ leaving }
							>
								{ __( 'Dismiss', __i18n_text_domain__ ) }
							</Button>
						) }
						<div className="agents-manager-context-card__body">{ card.body }</div>
						{ card.actions && card.actions.length > 0 && (
							<div className="agents-manager-context-card__actions">
								{ card.actions.map( ( action ) => (
									<Button
										key={ action.id || action.label }
										variant={ action.type === 'submit' ? 'primary' : 'secondary' }
										size="small"
										onClick={ () => onAction?.( card, action ) }
										disabled={ leaving }
									>
										{ action.label }
									</Button>
								) ) }
							</div>
						) }
					</section>
				</div>
			) ) }
		</div>
	);
}
