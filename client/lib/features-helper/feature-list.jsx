import config from '@automattic/calypso-config';

const headerClass = 'features-helper__feature-header';
const itemClass = 'features-helper__feature-item';
const enabledClass = 'features-helper__feature-item-enabled';
const disabledClass = 'features-helper__feature-item-disabled';

export default function FeatureList() {
	const currentXLProjects = [];
	const enabledFeatures = config.enabledFeatures();
	return (
		<>
			<div>Features</div>
			<div className="features-helper__current-features">
				<div className={ headerClass }>Current XL Projects</div>
				{ currentXLProjects.map( ( flag ) => {
					const isFlagEnabled = config.isEnabled( flag );
					return (
						<div
							key={ flag }
							className={ [ itemClass, isFlagEnabled ? enabledClass : disabledClass ].join( ' ' ) }
						>
							{ flag } { isFlagEnabled ? 'ON' : 'OFF' }
						</div>
					);
				} ) }
				<div className={ headerClass }>All Enabled Features</div>
				{ enabledFeatures.map( ( flag ) => (
					<div className={ itemClass } key={ flag }>
						{ flag }
					</div>
				) ) }
			</div>
		</>
	);
}
