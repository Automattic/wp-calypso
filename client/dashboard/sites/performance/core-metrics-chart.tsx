import { LineChart } from '@automattic/charts';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Valuation, getColorForStatus } from './utils';

const StatusIndicator = ({ speed }: {
	speed: Valuation;
}) => {
	const innerSvg: Record<Valuation, React.ReactNode> = {
		good: <rect x="1" y="1" width="10" height="10" rx="5" fill={getColorForStatus('good')} />,
		needsImprovement: <path
			d="M5.56292 0.786741C5.75342 0.443836 6.24658 0.443837 6.43708 0.786742L11.5873 10.0572C11.7725 10.3904 11.5315 10.8 11.1502 10.8H0.849757C0.468515 10.8 0.227531 10.3904 0.412679 10.0572L5.56292 0.786741Z"
			fill={getColorForStatus('needsImprovement')}
		/>,
		bad: <rect x="1" y="1" width="10" height="10" rx="2" fill={getColorForStatus('bad')} />,
	};

	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			{innerSvg[speed]}
		</svg>
	);
};

export default function CoreMetricsChart({ data, activeTab, metricsThresholds }: {
	data?: any;
	activeTab: string;
	metricsThresholds: any;
}) {
	const { good, needsImprovement, bad } = metricsThresholds[activeTab];

	// Generate dummy data for the last 30 days
	const generateDummyData = (baseValue: number, variance: number) => {
		const now = new Date();
		return Array.from({ length: 30 }, (_, index) => {
			const date = new Date(now);
			date.setDate(date.getDate() - (29 - index));

			// Add some realistic variance to the data
			const randomVariance = (Math.random() - 0.5) * variance;
			const value = Math.max(0, baseValue + randomVariance);

			return {
				date: date,
				value: Math.round(value * 100) / 100, // Round to 2 decimal places
			};
		});
	};

	const _data: Array<{
		label: string;
		data: Array<{ date: Date; value: number }>;
		options: {
			gradient: {
				from: string;
				to: string;
				fromOpacity: number;
				toOpacity: number;
			};
			stroke: string;
			legendShapeStyle: {
				color: string;
			};
		};
	}> = [
			{
				label: 'Largest Contentful Paint (LCP)',
				data: generateDummyData(2.5, 0.8), // LCP values around 2.5s with variance
				options: {
					gradient: {
						from: '#3858E9',
						to: '#3858E9',
						fromOpacity: 0.2,
						toOpacity: 0,
					},
					stroke: 'var(--dashboard__foreground-color-error)',
					legendShapeStyle: {
						color: '#3858E9',
					},
				},
			},
		];

	const formatUnit = (value: number | string) => {
		const num = parseFloat(value as string);
		if (['lcp', 'fcp', 'ttfb'].includes(activeTab)) {
			return +(num / 1000).toFixed(2);
		}
		return num;
	};

	const displayUnit = () => {
		if (['lcp', 'fcp', 'ttfb'].includes(activeTab)) {
			return __('s');
		}
		if (['inp', 'tbt'].includes(activeTab)) {
			return __('ms');
		}
		return '';
	};

	const isOverall = activeTab === 'overall';

	return (
		<>
			<HStack spacing={5} justify="flex-start">
				<div>
					<HStack justify="flex-start" alignment="center">
						<StatusIndicator speed="good" />
						<Text size="small">{__('Excellent')}</Text>
						<Text>
							{isOverall
								? sprintf(
									/* translators: %(to)s is the good threshold */
									__('(90–%(to)s)'),
									{
										to: formatUnit(good),
									}
								)
								: sprintf(
									/* translators: %(to)s is the good threshold, %(unit)s is the unit */
									__('(0–%(to)s%(unit)s)'),
									{
										to: formatUnit(good),
										unit: displayUnit(),
									}
								)}
						</Text>
					</HStack>
				</div>
				<div>
					<HStack justify="flex-start" alignment="center">
						<StatusIndicator speed="needsImprovement" />

						<Text size="small">{__('Needs Improvement')}</Text>
						<Text>
							{isOverall
								? sprintf(
									/* translators: %(to)s is the needs improvement threshold */
									__('(50–%(to)s)'),
									{
										to: formatUnit(needsImprovement),
									}
								)
								: sprintf(
									/* translators: %(from)s is the good threshold, %(to)s is the needs improvement threshold, %(unit)s is the unit */
									__('(%(from)s–%(to)s%(unit)s)'),
									{
										from: formatUnit(good),
										to: formatUnit(needsImprovement),
										unit: displayUnit(),
									}
								)}
						</Text>
					</HStack>
				</div>
				<div>
					<HStack justify="flex-start" alignment="center">
						<StatusIndicator speed="bad" />

						<Text size="small">{__('Poor')}</Text>
						<Text>
							{isOverall
								? sprintf(
									/* translators: %(to)s is the bad threshold */
									__('(0-%(to)s)'),
									{
										to: formatUnit(bad),
									}
								)
								: sprintf(
									/* translators: %(from)s is the needs improvement threshold, %(unit)s is the unit */
									__('(Over %(from)s%(unit)s)'),
									{
										from: formatUnit(needsImprovement),
										unit: displayUnit(),
									}
								)}
						</Text>
					</HStack>
				</div>
			</HStack>
			<LineChart
				data={_data}
				withGradientFill
				smoothing={false}
				maxWidth={1400}
				renderGlyph={(glyphProps) => {
					return <rect width="6" height="6" fill="#3858E9" />;
				}}
			/>
		</>
	);
}
