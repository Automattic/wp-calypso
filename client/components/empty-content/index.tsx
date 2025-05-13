import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { LegacyRef, RefObject } from 'react';
import illustrationEmptyResults from 'calypso/assets/images/illustrations/illustration-empty-results.svg';
import './style.scss';

interface EmptyContentProps {
	icon?: React.ReactNode;
	title?: string | null | React.ReactNode;
	illustration?: string | null;
	illustrationWidth?: number;
	illustrationHeight?: number;
	line?: string | React.ReactNode;
	action?: string | React.ReactNode;
	actionURL?: string;
	actionCallback?: () => void;
	actionTarget?: string;
	actionDisabled?: boolean;
	actionRef?: RefObject< HTMLElement > | LegacyRef< HTMLButtonElement >;
	secondaryAction?: React.ReactNode;
	secondaryActionURL?: string;
	secondaryActionCallback?: () => void;
	secondaryActionTarget?: string;
	className?: string;
	isCompact?: boolean;
	children?: React.ReactNode;
}

export default function EmptyContent( props: EmptyContentProps ): JSX.Element {
	function primaryAction(): null | React.ReactNode {
		if ( ! props.action ) {
			return null;
		}

		if ( typeof props.action !== 'string' ) {
			return props.action;
		}

		if ( props.actionURL || props.actionCallback ) {
			return (
				<Button
					primary
					className="empty-content__action"
					onClick={ props.actionCallback }
					href={ localizeUrl( props.actionURL ?? '' ) }
					target={ props.actionTarget }
					disabled={ props.actionDisabled }
					ref={ props.actionRef as LegacyRef< HTMLButtonElement > }
				>
					{ props.action }
				</Button>
			);
		}
	}

	function secondaryAction(): React.ReactNode {
		if ( typeof props.secondaryAction !== 'string' ) {
			return props.secondaryAction;
		}

		if ( props.secondaryActionURL || props.secondaryActionCallback ) {
			return (
				<Button
					className="empty-content__action button"
					onClick={ props.secondaryActionCallback }
					href={ props.secondaryActionURL }
					target={ props.secondaryActionTarget }
				>
					{ props.secondaryAction }
				</Button>
			);
		}
	}

	const { line, illustration = illustrationEmptyResults, isCompact = false } = props;
	const translate = useTranslate();
	const action = props.action && primaryAction();
	const secondaryActionEl = props.secondaryAction && secondaryAction();
	const title =
		props.title !== undefined ? props.title : translate( "You haven't created any content yet." );
	const illustrationEl = illustration && (
		<img
			src={ illustration }
			alt=""
			width={ props.illustrationWidth }
			height={ props.illustrationHeight }
			className="empty-content__illustration"
		/>
	);

	return (
		<div
			className={ clsx( 'empty-content', props.className, {
				'is-compact': isCompact,
				'has-title-only': title && ! props.line,
			} ) }
		>
			{ illustrationEl }
			{ props.icon && <div className="empty-content__icon">{ props.icon }</div> }
			{ typeof title === 'string' ? (
				<h2 className="empty-content__title">{ title }</h2>
			) : (
				title ?? null
			) }
			{ typeof line === 'string' ? (
				<h3 className="empty-content__line">{ props.line }</h3>
			) : (
				line ?? null
			) }
			{ action }
			{ secondaryActionEl }
			{ props.children }
		</div>
	);
}
