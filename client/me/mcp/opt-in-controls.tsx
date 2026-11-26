import { formatNumber } from '@automattic/number-formatters';
import {
	Icon,
	ToggleControl,
	VisuallyHidden,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { lock } from '@wordpress/icons';
import { Badge, Popover } from '@wordpress/ui';
import { requiresOptIn } from './group-intents';
import type { McpAbility } from '@automattic/api-core';

export function McpToolToggle( {
	tool,
	disabled,
	onChange,
}: {
	tool: Pick< McpAbility, 'title' | 'description' | 'enabled' | 'requires_opt_in' >;
	disabled: boolean;
	onChange: ( enabled: boolean ) => void;
} ) {
	const optIn = requiresOptIn( tool );
	const explanation = optIn
		? __( 'This tool needs separate approval, so “Enable all” skips it.' )
		: undefined;

	const toggle = (
		<ToggleControl
			__nextHasNoMarginBottom
			checked={ tool.enabled }
			disabled={ disabled }
			onChange={ onChange }
			label={ tool.title }
			help={
				optIn ? (
					<>
						{ tool.description } <VisuallyHidden as="span">{ explanation }</VisuallyHidden>
					</>
				) : (
					tool.description
				)
			}
		/>
	);
	if ( ! optIn ) {
		return toggle;
	}

	const badgeLabel = __( 'Turn on separately' );
	return (
		<HStack alignment="baseline" justify="flex-start" wrap>
			{ toggle }
			<HStack spacing={ 1 } expanded={ false }>
				<Icon icon={ lock } size={ 16 } aria-hidden="true" />
				<Badge
					infotip={ {
						popover: Popover,
						popup: (
							<Popover.Popup>
								<VisuallyHidden>
									<Popover.Title>{ badgeLabel }</Popover.Title>
								</VisuallyHidden>
								<Popover.Description>{ explanation }</Popover.Description>
							</Popover.Popup>
						),
					} }
				>
					{ badgeLabel }
				</Badge>
			</HStack>
		</HStack>
	);
}

export function getMcpBulkHelp( optInCount: number ) {
	if ( ! optInCount ) {
		return undefined;
	}

	return sprintf(
		/* translators: %s is the number of MCP tools that need separate approval. */
		_n(
			'This switch skips %s tool that needs separate approval. Turn it on or off by itself.',
			'This switch skips %s tools that need separate approval. Turn them on or off one at a time.',
			optInCount
		),
		formatNumber( optInCount )
	);
}
