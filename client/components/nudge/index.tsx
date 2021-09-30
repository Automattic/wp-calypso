import styled from '@emotion/styled';
import { Button, Gridicon } from '@automattic/components';
import cx from 'classnames';
import React, { useEffect } from 'react';
import { useMarketingMessage } from './use-marketing-message';
import './style.scss';

type NudgeProps = {
	useMockData: boolean;
	siteId: number | null;
	className?: string;
	path?: string;
};

const Container = styled.div< Pick< NudgeProps, 'path' > >`
	display: flex;
	position: ${ ( props ) => ( props.path === 'signup/plans' ? 'absolute' : 'static' ) };
	top: 0;
	width: 100%;
	z-index: ${ ( props ) => ( props.path === 'signup/plans' ? 31 : 'auto' ) };
`;

const Message = styled.div< Pick< NudgeProps, 'path' > >`
	position: relative;
	display: flex;
	justify-content: ${ ( props ) => ( props.path === 'signup/plans' ? 'center' : 'space-between' ) };
	align-items: center;
	background-color: var(
		${ ( props ) => ( props.path === 'signup/plans' ? '--color-accent-5' : '--color-neutral-80' ) }
	);
	color: var(
		${ ( props ) => ( props.path === 'signup/plans' ? '--color-text' : '--color-text-inverted' ) }
	);
	padding: 1em 2.5em;
	margin-bottom: 9px;
	flex-grow: 1;

	.button {
		position: ${ ( props ) => ( props.path === 'signup/plans' ? 'absolute' : 'relative' ) };
		display: flex;
		align-self: flex-start;
		min-width: 26px;
		min-height: 26px;
		left: ${ ( props ) => ( props.path === 'signup/plans' ? 'auto' : '1.5em' ) };
		right: ${ ( props ) => ( props.path === 'signup/plans' ? '10px' : 'auto' ) };
		color: var(
			${ ( props ) => ( props.path === 'signup/plans' ? '--color-text' : '--color-text-inverted' ) }
		);

		&:hover {
			color: var(
				${ ( props ) =>
					props.path === 'signup/plans' ? '--color-text' : '--color-text-inverted' }
			);
		}
	}
`;

const Text = styled.p< Pick< NudgeProps, 'path' > >`
	white-space: pre-wrap;
	text-indent: -1.5em;
	margin: 0;
`;

export default function Nudge( { siteId, useMockData, ...props }: NudgeProps ) {
	const [ isFetching, messages, removeMessage ] = useMarketingMessage( siteId, useMockData );
	const hasNudge = ! isFetching && messages.length > 0;

	useEffect( () => {
		document.body.classList.toggle( 'has-marketing-message', hasNudge );
	}, [ hasNudge ] );

	if ( ! hasNudge ) {
		return null;
	}

	return (
		<Container path={ props.path } className={ cx( 'nudge-container', props.className ) }>
			{ messages.map( ( msg ) => (
				<Message key={ msg.id } path={ props.path }>
					<Text path={ props.path }>{ msg.text }</Text>
					<Button compact borderless onClick={ () => removeMessage( msg.id ) }>
						<Gridicon icon="cross" size={ 24 } />
					</Button>
				</Message>
			) ) }
		</Container>
	);
}

Nudge.defaultProps = {
	useMockData: false,
	siteId: null,
};
