import { faker } from '@faker-js/faker';

export function getPostFromResponse(r) {
	let result;
	cy.request('GET', `/posts/${r.body.id}`).then((response) => {
		cy.log(`ID = ${r.body.id} returns post: ${JSON.stringify(response.body)}`);
		expect(response.status).to.be.equal(200);
		result = JSON.stringify(response.body);
	});
	return result;
}
export function comperePostsWithoutId(r, object) {
	cy.log(
		`Remove id from ${JSON.stringify(r)} and compare with ${JSON.stringify(
			object
		)}`
	);
	const { id: idr, ...responseWithoutId } = r.body;
	const { id: idObject, ...objectWithoutId } = object;
	expect(JSON.stringify(responseWithoutId)).to.be.equal(
		JSON.stringify(objectWithoutId)
	);
}

export function generatePosts(numberOfPosts) {
	cy.log(`Start GENERATE ${numberOfPosts} random POSTS`);

	for (let i = 0; i < numberOfPosts; i++) {
		cy.request({
			method: 'POST',
			url: '/posts',
			body: {
				userId: faker.number.int({ min: 10, max: 100 }),
				title: faker.lorem.words({ min: 1, max: 3 }),
				body: faker.lorem.words({ min: 10, max: 40 }),
			},
		}).then((response) => {
			cy.log(`Return created post: ${JSON.stringify(response.body)}`);
			expect(response.status).to.be.equal(201);
		});
	}
}
