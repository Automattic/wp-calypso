import { Badge } from '@automattic/ui';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useColorScheme, type ColorScheme } from 'calypso/lib/color-scheme';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

const TRACKS_EVENT = 'calypso_dashboard_color_scheme_change';
const TRACKS_SOURCE = 'preferences_appearance';

export default function Appearance() {
	const { colorScheme, setColorScheme } = useColorScheme();
	const { recordTracksEvent } = useAnalytics();

	const handleColorSchemeChange = ( value: string | number | undefined ) => {
		const nextColorScheme = value as ColorScheme;
		const previousColorScheme = colorScheme;

		setColorScheme( nextColorScheme, {
			onSuccess: () => {
				recordTracksEvent( TRACKS_EVENT, {
					color_scheme: nextColorScheme,
					previous_color_scheme: previousColorScheme,
					source: TRACKS_SOURCE,
				} );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Appearance' ) }
					description={ __( 'Customize the appearance.' ) }
					actions={ <Badge>{ __( 'Experimental' ) }</Badge> }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Color scheme' ) }
							description={ __(
								'Set the dashboard appearance to light, dark, or your system setting. This setting will also apply to other supported surface areas. This is experimental, if you like it or find issues we’d love to hear your feedback on it.'
							) }
						/>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Color scheme' ) }
							value={ colorScheme }
							onChange={ handleColorSchemeChange }
						>
							<ToggleGroupControlOption value="light" label={ __( 'Light' ) } />
							<ToggleGroupControlOption value="dark" label={ __( 'Dark' ) } />
							<ToggleGroupControlOption value="system" label={ __( 'Auto' ) } />
						</ToggleGroupControl>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
