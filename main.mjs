export default {
	rules: {
		'destructuring-merge': {
			meta: {
				type: 'suggestion',
				docs: {
					description: 'Merge consecutive destructuring declarations, including nested destructuring',
					category: 'Stylistic Issues',
					recommended: 'warn'
				},
				fixable: 'code',
				schema: []
			},

			create(context) {
				const sourceCode = context.getSourceCode()

				return {
					VariableDeclaration(node) {
						if (!['const', 'let', 'var'].includes(node.kind)) return
						if (node.declarations.length !== 1) return

						const declaration = node.declarations[0]
						if (declaration.type !== 'VariableDeclarator' || declaration.id.type !== 'ObjectPattern') return

						const { init } = declaration
						if (!init) return

						let initText
						let initIsMemberExpression = false // 标记 init 是否是 MemberExpression
						if (init.type === 'MemberExpression') {
							initText = sourceCode.getText(init.object)
							initIsMemberExpression = true
						} else if (init.type === 'Identifier')
							initText = sourceCode.getText(init)
						else
							return


						const parentNode = node.parent
						if (!parentNode || !parentNode.body) return
						const { body } = parentNode
						const currentNodeIndex = body.indexOf(node)
						if (currentNodeIndex === -1) return

						const declarationsToMerge = [declaration]
						let nextNodeIndex = currentNodeIndex + 1
						while (nextNodeIndex < body.length) {
							const nextNode = body[nextNodeIndex]
							if (nextNode.type === 'VariableDeclaration' && nextNode.kind === node.kind && nextNode.declarations.length === 1) {
								const nextDecl = nextNode.declarations[0]
								if (nextDecl.type === 'VariableDeclarator' && nextDecl.id.type === 'ObjectPattern' && nextDecl.init) {
									let nextInitText
									let nextInitIsMemberExpression = false
									if (nextDecl.init.type === 'MemberExpression') {
										nextInitText = sourceCode.getText(nextDecl.init.object)
										nextInitIsMemberExpression = true
									} else if (nextDecl.init.type === 'Identifier')
										nextInitText = sourceCode.getText(nextDecl.init)
									else
										break


									if (nextInitText === initText) {
										declarationsToMerge.push(nextDecl)
										nextNodeIndex++
									} else
										break

								} else
									break

							} else
								break

						}

						if (declarationsToMerge.length <= 1) return

						context.report({
							node,
							message: 'Merge destructuring declarations from the same object',
							fix: (fixer) => {
								const topLevelProperties = []
								const nestedProperties = {}
								let allFromMemberExpression = true // 标记是否所有声明都来自 MemberExpression

								for (const decl of declarationsToMerge) {
									const currentInit = decl.init
									if (currentInit.type === 'MemberExpression') {
										const objectName = sourceCode.getText(currentInit.object)
										const propertyName = currentInit.property.name || sourceCode.getText(currentInit.property)

										if (!nestedProperties[propertyName])
											nestedProperties[propertyName] = { properties: [], range: currentInit.object.range }

										nestedProperties[propertyName].properties.push(...decl.id.properties)
									} else {
										topLevelProperties.push(...decl.id.properties)
										allFromMemberExpression = false
									}
								}


								let combinedCode
								// 优先解构 req.cookies (如果所有属性都来自它)
								if (allFromMemberExpression && Object.keys(nestedProperties).length === 1) {
									const nestedObj = Object.values(nestedProperties)[0]
									const propsString = nestedObj.properties.map(p => sourceCode.getText(p)).join(', ')
									const objectName = declarationsToMerge[0].init.property.name // 获取属性名 (cookies)
									combinedCode = `${node.kind} { ${propsString} } = ${initText}.${objectName}` //  req.cookies
								} else { // 否则，解构 req，并可能嵌套解构

									let combinedPropertiesString = topLevelProperties.map(p => sourceCode.getText(p)).join(', ')
									let nestedDestructuringString = ''

									for (const nestedObjectName in nestedProperties) {
										const nestedObj = nestedProperties[nestedObjectName]
										const nestedPropsString = nestedObj.properties.map(p => sourceCode.getText(p)).join(', ')
										if (combinedPropertiesString)
											nestedDestructuringString += `, ${nestedObjectName}: { ${nestedPropsString} }`
										else
											nestedDestructuringString += `${nestedObjectName}: { ${nestedPropsString} }`

									}

									if (combinedPropertiesString && nestedDestructuringString)
										combinedPropertiesString = `${combinedPropertiesString}${nestedDestructuringString}`
									else if (!combinedPropertiesString && nestedDestructuringString)
										combinedPropertiesString = nestedDestructuringString


									combinedCode = `${node.kind} { ${combinedPropertiesString} } = ${initText}`
								}


								const startNode = node
								const endNode = declarationsToMerge[declarationsToMerge.length - 1].parent

								return fixer.replaceTextRange([startNode.range[0], endNode.range[1]], combinedCode)
							}
						})
					}
				}
			}
		}
	}
}
