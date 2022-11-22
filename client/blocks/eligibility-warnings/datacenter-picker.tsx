import styled from '@emotion/styled';
import { localize, LocalizeProps, translate } from 'i18n-calypso';

const DatacenterOptions = [
	{
		value: '',
		label: translate( 'Automatically place my site in the best datacenter' ),
	},
	{
		value: 'ams',
		label: translate( 'Amsterdam (AMS)' ),
	},
	{
		value: 'bur',
		label: translate( 'Burbank, California (BUR)' ),
	},
	{
		value: 'dfw',
		label: translate( 'Dallas-Fort Worth, Texas (DFW)' ),
	},
	{
		value: 'dca',
		label: translate( 'Washington, D.C. (DCA)' ),
	},
];

const Container = styled.div( {
	marginTop: '10px',
} );

const Label = styled.label( {
	display: 'block',
} );

interface ExternalProps {
	value: string;
	onChange: () => void;
}

type Props = ExternalProps & LocalizeProps;

const DatacenterPicker = ( { translate, value, onChange }: Props ) => {
	return (
		<Container role="radiogroup">
			{ translate( 'Choose a datacenter for your site:' ) }
			{ DatacenterOptions.map( ( option ) => {
				return (
					<Label key={ option.label }>
						<input
							className="form-radio"
							name="geo_affinity"
							type="radio"
							value={ option.value }
							checked={ value === option.value }
							onChange={ () => onChange( option.value ) }
						/>
						{ option.label }
					</Label>
				);
			} ) }
		</Container>
	);
};

export default localize( DatacenterPicker );
