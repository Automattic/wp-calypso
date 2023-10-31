import { useState } from 'react';

export default function useSelectedStyleVariation() {
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState();

	return { selectedStyleVariation, setSelectedStyleVariation };
}
