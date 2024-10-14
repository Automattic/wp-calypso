import { Card } from '@automattic/components';
import { useState } from 'react';
import DataCenterPicker from 'calypso/blocks/data-center-picker';

const DataCenterPickerExample = () => {
	const [ value, setValue ] = useState( '' );

	return (
		<div>
			<Card compact>
				<DataCenterPicker onChange={ setValue } value={ value } />
			</Card>
		</div>
	);
};

DataCenterPickerExample.displayName = 'DataCenterPicker';

export default DataCenterPickerExample;
