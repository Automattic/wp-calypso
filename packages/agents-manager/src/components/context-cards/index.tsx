import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import './style.scss';
import type { ExternalContextCard, ExternalContextCardAction } from '../../utils/external-context';

interface Props {
	cards: ExternalContextCard[];
	onAction?: ( card: ExternalContextCard, action: ExternalContextCardAction ) => void;
	onDismiss?: ( card: ExternalContextCard ) => void;
}

interface RenderedCard {
	card: ExternalContextCard;
	leaving: boolean;
}

// Keep in sync with $context-card-leave-duration in style.scss.
const LEAVE_DURATION_MS = 220;

export default function ContextCards( { cards, onAction, onDismiss }: Props ) {
	const [ rendered, setRendered ] = useState< RenderedCard[] >( () =>
		cards.map( ( card ) => ( { card, leaving: false } ) )
	);

	// Reconcile local render list with incoming props: keep order, mark removed
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
		const hasLeaving = rendered.some( ( entry ) => entry.leaving );
		if ( ! hasLeaving ) {
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
			aria-label={ __( 'Chat context', '__i18n_text_domain__' ) }
		>
			{ rendered.map( ( { card, leaving } ) => (
				<div
					key={ card.id }
					className={ clsx( 'agents-manager-context-card-wrapper', {
						'agents-manager-context-card-wrapper--leaving': leaving,
					} ) }
					aria-hidden={ leaving || undefined }
				>
					<section
						className={ clsx(
							'agents-manager-context-card',
							`agents-manager-context-card--${ card.tone || 'default' }`,
							{ 'agents-manager-context-card--custom': !! card.body }
						) }
					>
						{ card.body ? (
							<>
								{ onDismiss && (
									<Button
										className="agents-manager-context-card__dismiss agents-manager-context-card__dismiss--floating"
										variant="tertiary"
										size="small"
										onClick={ () => onDismiss( card ) }
										aria-label={ __(
											'Dismiss context card',
											'__i18n_text_domain__'
										) }
										disabled={ leaving }
									>
										{ __( 'Dismiss', '__i18n_text_domain__' ) }
									</Button>
								) }
								<div className="agents-manager-context-card__body">{ card.body }</div>
							</>
						) : (
							<>
								<div className="agents-manager-context-card__header">
									<div>
										{ card.source && (
											<div className="agents-manager-context-card__source">
												{ card.source }
											</div>
										) }
										{ card.title && (
											<h3 className="agents-manager-context-card__title">{ card.title }</h3>
										) }
										{ card.subtitle && (
											<p className="agents-manager-context-card__subtitle">
												{ card.subtitle }
											</p>
										) }
									</div>
									{ onDismiss && (
										<Button
											className="agents-manager-context-card__dismiss"
											variant="tertiary"
											size="small"
											onClick={ () => onDismiss( card ) }
											aria-label={ __(
												'Dismiss context card',
												'__i18n_text_domain__'
											) }
											disabled={ leaving }
										>
											{ __( 'Dismiss', '__i18n_text_domain__' ) }
										</Button>
									) }
								</div>
								{ card.description && (
									<p className="agents-manager-context-card__description">
										{ card.description }
									</p>
								) }
								{ card.stats && card.stats.length > 0 && (
									<div className="agents-manager-context-card__stats">
										{ card.stats.map( ( stat ) => (
											<div
												key={ `${ stat.label }-${ stat.value }` }
												className="agents-manager-context-card__stat"
											>
												<strong>{ stat.value }</strong>
												<span>{ stat.label }</span>
												{ stat.description && <small>{ stat.description }</small> }
											</div>
										) ) }
									</div>
								) }
								{ card.bullets && card.bullets.length > 0 && (
									<ul className="agents-manager-context-card__bullets">
										{ card.bullets.map( ( bullet ) => (
											<li key={ bullet }>{ bullet }</li>
										) ) }
									</ul>
								) }
							</>
						) }
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
