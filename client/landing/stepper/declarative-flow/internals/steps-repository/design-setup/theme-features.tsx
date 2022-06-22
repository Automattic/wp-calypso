import classnames from 'classnames';
import './theme-features.scss';

interface Feature {
	name: string;
}

interface FeaturesProps {
	classNames?: string;
	features: Feature[];
	heading?: string;
}

const ThemeFeatures = ( { classNames, features, heading }: FeaturesProps ) => {
	const classes = classnames( 'theme-features__features-wrap popup-item', classNames );
	return (
		<>
			{ features.length > 0 && (
				<div className={ classes }>
					{ heading && <h2>{ heading }</h2> }
					<div className="theme-features__features">
						{ features.map( ( feature, idx ) => {
							return (
								<div className="theme-features__feature" key={ idx }>
									{ feature.name }
								</div>
							);
						} ) }
					</div>
				</div>
			) }
		</>
	);
};

export default ThemeFeatures;
