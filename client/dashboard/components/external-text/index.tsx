import { Icon, __experimentalHStack as HStack, FlexBlock } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import type { ReactNode } from 'react';

interface ExternalTextProps {
	/**
	 * The text to display. If not provided, only the icon will be shown.
	 */
	children?: ReactNode;
	/**
	 * How to justify the content. 'space-between' will push the icon to the right.
	 * Defaults to 'flex-start' which keeps them together.
	 */
	justify?: 'flex-start' | 'space-between';
	/**
	 * Size of the external icon
	 */
	iconSize?: number;
	/**
	 * Additional CSS class names
	 */
	className?: string;
}

export default function ExternalText( {
	children,
	justify = 'flex-start',
	iconSize = 16,
	className,
}: ExternalTextProps ) {
	// For simple inline rendering (like inside buttons), use a span instead of HStack
	if ( ! className && justify === 'flex-start' ) {
		return (
			<span style={ { display: 'inline-flex', alignItems: 'center', gap: '4px' } }>
				{ children }
				<Icon
					icon={ external }
					size={ iconSize }
					className="components-external-link__icon"
					aria-label={
						/* translators: accessibility text */
						__( '(opens in a new tab)' )
					}
				/>
			</span>
		);
	}

	// For more complex layouts, use HStack
	const renderChildren = () => {
		if ( ! children ) {
			return null;
		}
		if ( justify === 'space-between' ) {
			return <FlexBlock>{ children }</FlexBlock>;
		}
		return children;
	};

	return (
		<HStack
			justify={ justify }
			spacing={ justify === 'space-between' ? 0 : 2 }
			className={ className }
		>
			{ renderChildren() }
			<Icon
				icon={ external }
				size={ iconSize }
				className="components-external-link__icon"
				aria-label={
					/* translators: accessibility text */
					__( '(opens in a new tab)' )
				}
			/>
		</HStack>
	);
}
