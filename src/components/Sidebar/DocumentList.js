import {
	createDocument,
	deleteDocument,
	getRootDocuments,
} from '../../utils/api/api.js';
import { createElement } from '../../utils/createElement.js';
import {
	getItem,
	OPENED_DOCUMENT_ITEMS,
	setItem,
} from '../../utils/storage.js';

/**
 *
 * @param {{
 * 					$target: HTMLElement,
 * 					initialState: Array
 * 				}}
 */
export default function DocumentList({ $target, initialState = [] }) {
	const $documentList = createElement({
		element: 'div',
		$target,
		className: 'document-list__root',
	});

	this.state = initialState;

	this.setState = (nextState) => {
		this.state = nextState;
		this.render();
	};

	// todo : template 코드는 따로 빼둬야 할 듯.
	this.render = async () => {
		const openedDocumentItems = getItem(OPENED_DOCUMENT_ITEMS, []);
		$documentList.innerHTML = `
			${this.state
				.map(
					({ id, title, documents: subDocumentList }) => `
				<div class='document-item-container'>
					<div data-id='${id}' class='document-item'>
						<img data-action='toggle' src='./src/assets/images/toggleButton.svg'>
						<span>${id}</span>
						<img data-action='delete' src='./src/assets/images/deleteButton.svg'>
						<img data-action='add' src='./src/assets/images/addButton.svg'>
					</div>
					${openedDocumentItems.includes(String(id)) ? makeSubDocumentList(id, subDocumentList) : ''}
				</div>
			`
				)
				.join('')}	
		`;
	};

	this.render();

	// todo : 따로 util로 빼자.
	const makeSubDocumentList = (id, subDocumentList) => {
		const openedDocumentItems = getItem(OPENED_DOCUMENT_ITEMS, []);
		
		let subDocumentListTemplate = `
			<ul class='document-list'>
				${subDocumentList.map(({id, title, documents: subSubDocumentList}) => `
					<div class='document-item-container'>
						<div data-id='${id}' class='document-item'>
							<img data-action='toggle' src='./src/assets/images/toggleButton.svg'>
							<span>${id}</span>
							<img data-action='delete' src='./src/assets/images/deleteButton.svg'>
							<img data-action='add' src='./src/assets/images/addButton.svg'>
						</div>
						${openedDocumentItems.includes(String(id)) ? makeSubDocumentList(id, subSubDocumentList) : ''}
					</div>
				`).join('')}
			</ul>
		`
		
		return subDocumentListTemplate;
	};
	
	$documentList.addEventListener('click', async (event) => {
		event.stopPropagation();
		const {target} = event;
		const {action} = target.dataset;
		const {id} = target.closest('div').dataset;
		
		if (action) {
			const storedOpenedDocumentsItems = getItem(OPENED_DOCUMENT_ITEMS, []);
			
			switch (action) {
				case 'toggle':
					if (storedOpenedDocumentsItems.includes(id)) {
						const removedOpenedDocumentItemIndex = storedOpenedDocumentsItems.findIndex(openedDocumentItemId => openedDocumentItemId === id);
						
						if (removedOpenedDocumentItemIndex !== -1)	storedOpenedDocumentsItems.splice(removedOpenedDocumentItemIndex, 1);
						setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems]);
					
					} else {
						setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems, id])
						
					}
					this.setState([...this.state]);
					break;
				case 'delete':
					const removedOpenedDocumentItemIndex = storedOpenedDocumentsItems.findIndex(openedDocumentItemId => openedDocumentItemId === id)
					if (removedOpenedDocumentItemIndex !== -1) storedOpenedDocumentsItems.splice(removedOpenedDocumentItemIndex, 1);
					setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems]);
					await deleteDocument(id);
					const nextRootDocumentsAfterDeleteAction = await getRootDocuments();
					this.setState(nextRootDocumentsAfterDeleteAction);
					break;
				case 'add':
					if (!storedOpenedDocumentsItems.includes(id)) setItem(OPENED_DOCUMENT_ITEMS, [...storedOpenedDocumentsItems, id])
					await createDocument({parent: id})
					const nextRootDocumentsAfterCreateAction = await getRootDocuments();
					this.setState(nextRootDocumentsAfterCreateAction);
					break;
			}
		}
	})
}
