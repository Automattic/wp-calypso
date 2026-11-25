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
		? __( 'This tool needs individual approval, so “Enable all” skips it.' )
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

	const badgeLabel = __( 'Turn on individually' );
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
		/* translators: %s is the number of MCP tools that require individual approval. */
		_n(
			'Doesn’t change %s locked tool. Turn it on or off individually.',
			'Doesn’t change %s locked tools. Turn them on or off individually.',
			optInCount
		),
		formatNumber( optInCount )
	);
}
