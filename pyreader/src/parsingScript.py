import sys
import ast

class Parent:
	"""Representation of a node used for hierarchy tracking"""
	def __init__(self, type: str, indent: int, prevHigh: int):
		self.type = type
		self.indent = indent
		self.skip = (type == "skip" or type == "base")
		self.high = prevHigh if self.skip else self.indent


# import script as command line argument
try:
	toParse = sys.argv[1]
except IndexError:
	print("PARSING ERROR: No script in command line arguments")
	sys.exit(2)


parseList = toParse.split("\n")
code = toParse
tree = ast.parse(code)

class DepthFirst(ast.NodeVisitor):
	'''This class is used to recursively navigate the tree, depth first. To check for another node type, overide another function: visit_CLASSNAME'''	
	def __init__(self, parseList):
		'''parseList should be a list of lines (strings)'''
		self.parseList = parseList
		self.set = [] # this is used to avoid adding already parsed lines to parent stack
		self.prevNode = Parent("base", -4, -4)
		self.parentTree = []
	
	def readIndent(self, lineno):
		'''Determine indent level'''
		line = self.parseList[lineno - 1]
		indent = len(line) - len(line.lstrip())
		return indent
	
	def printNode(self, node, name, type):
		lineno = node.lineno
		indent = self.prevNode.indent
		print('{"name": "', name, '", "line": ',
			lineno, ', "type": "', type, '", "level":', indent, ', "parentLevel": ', self.parentTree[-1].high, '}', sep="")
		self.set.append(lineno)
	
	def handleNode(self, node, name, type):
		'''Called when node type is one we explicitly check'''
		if type != "skip":
			if not node.lineno in self.set: # we still want to print values in lines already parsed, but not add them to parent tree
				self.prevNode = Parent(type, self.prevNode.indent, self.parentTree[-1].high)
			self.printNode(node, name, type)
		self.generic_visit(node) # visit children
	
	def visit(self, node):
		"""Called on every node, overridden to include hierarchy tracking"""
		# update hierarchy
		if hasattr(node, "lineno") and not node.lineno in self.set:
			indent = self.readIndent(node.lineno)
			if indent > self.prevNode.indent:
				self.parentTree += [self.prevNode]
			while indent <= self.parentTree[-1].indent:
				self.parentTree.pop()
			self.prevNode = Parent("skip", indent, self.parentTree[-1].high)
		
		# determine proper function and visit
		method = 'visit_' + node.__class__.__name__
		visitor = getattr(self, method, self.generic_visit)
		return visitor(node)
	
	def visit_FunctionDef(self, node):
		'''Function definition'''
		self.handleNode(node, node.name, "function")
	
	# parsing for lists separately is disabled because of the way it interacts with classes
	#def visit_Assign(self, node):
	#	'''List declaration'''
	#	if isinstance(node.value, ast.List):
	#		self.handleNode(node, node.targets[0].id, "list")
	#	else:
	#		self.handleNode(node, "skip", "skip")

	def visit_Name(self, node):
		'''Variable'''
		if isinstance(node.ctx, ast.Store):
			self.handleNode(node, node.id, "variable")
		else:
			self.handleNode(node, "skip", "skip")

	def visit_ClassDef(self, node):
		'''Function definition'''
		self.handleNode(node, node.name, "class")

depthFirst = DepthFirst(parseList)
depthFirst.visit(tree)
