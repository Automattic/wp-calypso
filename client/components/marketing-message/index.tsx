import { Button, Gridicon } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import cx from 'classnames';
import { useEffect } from 'react';
import { useMarketingMessage } from './use-marketing-message';
import './style.scss';

type NudgeProps = {
	useMockData: boolean;
	siteId: number | null;
	className?: string;
	path: string;
};

const Container = styled.div< Pick< NudgeProps, 'path' > >`
	display: flex;

	&.is-signup-plans {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 31;

		@media ( max-width: 782px ) {
			position: fixed;
		}
	}
`;

const Message = styled.div< { isPlansStep: boolean } >`
	position: relative;
	display: flex;
	justify-content: ${ ( props ) => ( props.isPlansStep ? 'center' : 'space-between' ) };
	align-items: center;
	background-color: var(
		${ ( props ) => ( props.isPlansStep ? '--color-accent-5' : '--color-neutral-80' ) }
	);
	color: var( ${ ( props ) => ( props.isPlansStep ? '--color-text' : '--color-text-inverted' ) } );
	padding: 1em 2.5em;
	margin-bottom: 9px;
	flex-grow: 1;

	.button {
		position: ${ ( props ) => ( props.isPlansStep ? 'absolute' : 'relative' ) };
		display: flex;
		align-self: flex-start;
		min-width: 26px;
		min-height: 26px;
		left: ${ ( props ) => ( props.isPlansStep ? 'auto' : '1.5em' ) };
		right: ${ ( props ) => ( props.isPlansStep ? '10px' : 'auto' ) };
		color: var(
			${ ( props ) => ( props.isPlansStep ? '--color-text' : '--color-text-inverted' ) }
		);

		&:hover {
			color: var(
				${ ( props ) => ( props.isPlansStep ? '--color-text' : '--color-text-inverted' ) }
			);
		}
	}
`;

const LimitedTimeOfferNudgeMessage = styled.div< { isPlansStep: boolean } >`
	position: relative;
	font-size: 0.875rem;
	margin-bottom: 9px;
	width: 100%;

	.button {
		position: relative;
		left: 1.5em;
		right: auto;
		min-width: 92px;
	}
	.banner__icon-circle {
		background-color: var( --color-accent );
	}
`;

const Text = styled.p< Pick< NudgeProps, 'path' > >`
	white-space: pre-wrap;
	text-indent: -1.5em;
	margin: 0;
`;

function slugify( text: string ) {
	return text
		.trim()
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' );
}

function renderCTAButton( msg: any ) {
	if ( msg.buttonText && msg.buttonLink ) {
		return (
			<Button className="button is-compact is-primary" href={ msg.buttonLink } target="_blank">
				{ msg.buttonText }
			</Button>
		);
	}
	return null;
}

export default function MarketingMessage( { siteId, useMockData, ...props }: NudgeProps ) {
	const [ isFetching, messages, removeMessage ] = useMarketingMessage( siteId, useMockData );
	const hasNudge = ! isFetching && messages.length > 0;

	useEffect( () => {
		document.body.classList.toggle( 'has-marketing-message', hasNudge );
	}, [ hasNudge ] );

	if ( ! hasNudge ) {
		return null;
	}

	const classNames = cx( 'nudge-container', props.className, `is-${ slugify( props.path ) }` );

	return (
		<Container path={ props.path } className={ classNames } role="status">
			{ messages.map( ( msg ) =>
				msg.id === 'limited_time_offer' ? (
					<LimitedTimeOfferNudgeMessage
						key={ msg.id }
						isPlansStep={ props.path === 'signup/plans' }
					>
						<a
							href={ msg.buttonLink }
							className={ cx( 'card banner upsell-nudge is-card-link is-clickable' ) }
						>
							<div className="banner__icons">
								<div className="banner__icon-circle">
									<Gridicon icon="star" size={ isMobile() ? 24 : 18 } />
								</div>
							</div>
							<div className="banner__content">
								<div className="banner__info">
									<div className="banner__title">
										<b>{ msg.text }</b>
									</div>
								</div>
							</div>
							{ renderCTAButton( msg ) }
						</a>
					</LimitedTimeOfferNudgeMessage>
				) : (
					<Message key={ msg.id } isPlansStep={ props.path === 'signup/plans' }>
						<Text path={ props.path }>{ msg.text }</Text>
						<Button compact borderless onClick={ () => removeMessage( msg.id ) }>
							<Gridicon icon="cross" size={ 24 } />
						</Button>
					</Message>
				)
			) }
		</Container>
	);
}

MarketingMessage.defaultProps = {
	useMockData: false,
	siteId: null,
	path: '',
};
