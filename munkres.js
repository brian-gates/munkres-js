"use strict";

/**
 * Introduction
 * ============
 * 
 * The Munkres module provides an implementation of the Munkres algorithm
 * (also called the Hungarian algorithm or the Kuhn-Munkres algorithm),
 * useful for solving the Assignment Problem.
 * 
 * Assignment Problem
 * ==================
 * 
 * Let C be an n×n-matrix representing the costs of each of n workers
 * to perform any of n jobs. The assignment problem is to assign jobs to
 * workers in a way that minimizes the total cost. Since each worker can perform
 * only one job and each job can be assigned to only one worker the assignments
 * represent an independent set of the matrix C.
 * 
 * One way to generate the optimal set is to create all permutations of
 * the indices necessary to traverse the matrix so that no row and column
 * are used more than once. For instance, given this matrix (expressed in
 * Python)
 * 
 * 	matrix = [[5, 9, 1],
 * 			  [10, 3, 2],
 * 			  [8, 7, 4]]
 * 
 * You could use this code to generate the traversal indices::
 * 
 * 	def permute(a, results):
 * 		if len(a) == 1:
 * 			results.insert(len(results), a)
 * 
 * 		else:
 * 			for i in range(0, len(a)):
 * 				element = a[i]
 * 				a_copy = [a[j] for j in range(0, len(a)) if j != i]
 * 				subresults = []
 * 				permute(a_copy, subresults)
 * 				for subresult in subresults:
 * 					result = [element] + subresult
 * 					results.insert(len(results), result)
 * 
 * 	results = []
 * 	permute(range(len(matrix)), results) # [0, 1, 2] for a 3x3 matrix
 * 
 * After the call to permute(), the results matrix would look like this::
 * 
 * 	[[0, 1, 2],
 * 	 [0, 2, 1],
 * 	 [1, 0, 2],
 * 	 [1, 2, 0],
 * 	 [2, 0, 1],
 * 	 [2, 1, 0]]
 * 
 * You could then use that index matrix to loop over the original cost matrix
 * and calculate the smallest cost of the combinations
 * 
 * 	n = len(matrix)
 * 	minval = sys.maxsize
 * 	for row in range(n):
 * 		cost = 0
 * 		for col in range(n):
 * 			cost += matrix[row][col]
 * 		minval = min(cost, minval)
 * 
 * 	print minval
 * 
 * While this approach works fine for small matrices, it does not scale. It
 * executes in O(n!) time: Calculating the permutations for an n×x-matrix
 * requires n! operations. For a 12×12 matrix, that’s 479,001,600
 * traversals. Even if you could manage to perform each traversal in just one
 * millisecond, it would still take more than 133 hours to perform the entire
 * traversal. A 20×20 matrix would take 2,432,902,008,176,640,000 operations. At
 * an optimistic millisecond per operation, that’s more than 77 million years.
 * 
 * The Munkres algorithm runs in O(n³) time, rather than O(n!). This
 * package provides an implementation of that algorithm.
 * 
 * This version is based on
 * http://www.public.iastate.edu/~ddoty/HungarianAlgorithm.html.
 * 
 * This version was originally written for Python by Brian Clapper from the (Ada) 
 * algorithm at the above web site (The ``Algorithm::Munkres`` Perl version, 
 * in CPAN, was clearly adapted from the same web site.) and ported to
 * JavaScript by Hauke Henningsen (addaleax).
 * 
 * Usage
 * =====
 * 
 * Construct a Munkres object
 * 
 * 	var m = new Munkres();
 * 
 * Then use it to compute the lowest cost assignment from a cost matrix. Here’s
 * a sample program
 * 
 * 	var matrix = [[5, 9, 1],
 * 			     [10, 3, 2],
 * 			     [8, 7, 4]];
 * 	var m = new Munkres();
 * 	var indices = m.compute(matrix);
 * 	console.log(format_matrix(matrix), 'Lowest cost through this matrix:');
 * 	var total = 0;
 * 	for (var i = 0; i < indices.length; ++i) {
 * 		var row = indices[l][0], col = indices[l][1];
 * 		var value = matrix[row][col];
 * 		total += value;
 * 		
 * 		console.log('(' + rol + ', ' + col + ') -> ' + value);
 * 	}
 * 	
 * 	console.log('total cost:', total);
 * 
 * Running that program produces::
 * 
 * 	Lowest cost through this matrix:
 * 	[5, 9, 1]
 * 	[10, 3, 2]
 * 	[8, 7, 4]
 * 	(0, 0) -> 5
 * 	(1, 1) -> 3
 * 	(2, 2) -> 4
 * 	total cost: 12
 * 
 * The instantiated Munkres object can be used multiple times on different
 * matrices.
 * 
 * Non-square Cost Matrices
 * ========================
 * 
 * The Munkres algorithm assumes that the cost matrix is square. However, it's
 * possible to use a rectangular matrix if you first pad it with 0 values to make
 * it square. This module automatically pads rectangular cost matrices to make
 * them square.
 * 
 * Notes:
 * 
 * - The module operates on a *copy* of the caller's matrix, so any padding will
 *   not be seen by the caller.
 * - The cost matrix must be rectangular or square. An irregular matrix will
 *   *not* work.
 * 
 * Calculating Profit, Rather than Cost
 * ====================================
 * 
 * The cost matrix is just that: A cost matrix. The Munkres algorithm finds
 * the combination of elements (one from each row and column) that results in
 * the smallest cost. It’s also possible to use the algorithm to maximize
 * profit. To do that, however, you have to convert your profit matrix to a
 * cost matrix. The simplest way to do that is to subtract all elements from a
 * large value.
 * 
 * The ``munkres`` module provides a convenience method for creating a cost
 * matrix from a profit matrix, i.e. make_cost_matrix.
 * 
 * References
 * ==========
 * 
 * 1. http://www.public.iastate.edu/~ddoty/HungarianAlgorithm.html
 * 
 * 2. Harold W. Kuhn. The Hungarian Method for the assignment problem.
 *    *Naval Research Logistics Quarterly*, 2:83-97, 1955.
 * 
 * 3. Harold W. Kuhn. Variants of the Hungarian method for assignment
 *    problems. *Naval Research Logistics Quarterly*, 3: 253-258, 1956.
 * 
 * 4. Munkres, J. Algorithms for the Assignment and Transportation Problems.
 *    *Journal of the Society of Industrial and Applied Mathematics*,
 *    5(1):32-38, March, 1957.
 * 
 * 5. http://en.wikipedia.org/wiki/Hungarian_algorithm
 * 
 * Copyright and License
 * =====================
 * 
 * This software is released under a BSD license, adapted from
 * <http://opensource.org/licenses/bsd-license.php>
 * 
 * Copyright (c) 2008 Brian M. Clapper
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * Neither the name "clapper.org" nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var maxsize = Number.MAX_SAFE_INTEGER || (1 << 52);

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/**
 * Calculate the Munkres solution to the classical assignment problem.
 * See the module documentation for usage.
 */
function Munkres() {
	this.C = null
	
	this.row_covered = []
	this.col_covered = []
	this.n = 0
	this.Z0_r = 0
	this.Z0_c = 0
	this.marked = null
	this.path = null
}

/**
 * Pad a possibly non-square matrix to make it square.
 * 
 * Parameters
 * 	matrix : list of lists
 * 		matrix to pad
 * 
 * 	pad_value : int
 * 		value to use to pad the matrix
 * 
 * rtype: list of lists
 * return: a new, possibly padded, matrix
 */
Munkres.prototype.pad_matrix = function(matrix, pad_value) {
	pad_value = pad_value || 0;
	
	var max_columns = 0;
	var total_rows = matrix.length;
	
	for (var i = 0; i < total_rows; ++i)
		if (matrix[i].length > max_columns)
			max_columns = matrix[i].length;
	
	total_rows = max_columns > total_rows ? max_columns : total_rows;
	
	var new_matrix = [];
	
	for (var i = 0; i < total_rows; ++i) {
		var row = matrix[i] || [];
		var new_row = row.slice();
		
		// If this row is too short, pad it
		while (total_rows > new_row.length)
			new_row.push(0);
		
		new_matrix.push(new_row);
	}
	
	return new_matrix;
};

/**
 * 
 * Compute the indices for the lowest-cost pairings between rows and
 * columns in the database. Returns a list of (row, column) tuples
 * that can be used to traverse the matrix.
 * 
 * Parameters
 * 	cost_matrix : list of lists
 * 		The cost matrix. If this cost matrix is not square, it
 * 		will be padded with zeros, via a call to ``pad_matrix()``.
 * 		(This method does *not* modify the caller's matrix. It
 * 		operates on a copy of the matrix.)
 * 
 * 		**WARNING**: This code handles square and rectangular
 * 		matrices. It does *not* handle irregular matrices.
 * 
 * rtype list
 * return A list of ``(row, column)`` tuples that describe the lowest
 * 		 cost path through the matrix
 */
Munkres.prototype.compute = function(cost_matrix) {
	this.C = this.pad_matrix(cost_matrix);
	this.n = this.C.length;
	this.original_length = cost_matrix.length;
	this.original_width = cost_matrix[0].length;
	
	var nfalseArray = []; /* array of n false values */
	while (nfalseArray.length < this.n)
		nfalseArray.push(false);
	this.row_covered = nfalseArray.slice();
	this.col_covered = nfalseArray.slice();
	this.Z0_r = 0;
	this.Z0_c = 0;
	this.path =   this.__make_matrix(this.n * 2, 0);
	this.marked = this.__make_matrix(this.n, 0);
	
	var step = 1;
	
	var steps = { 1 : this.__step1,
	              2 : this.__step2,
	              3 : this.__step3,
	              4 : this.__step4,
	              5 : this.__step5,
	              6 : this.__step6 };
	
	while (true) {
		var func = steps[step];
		if (!func) // done
			break;
		
		step = func();
	}
	
	var results = [];
	for (var i = 0; i < this.original_length; ++i)
		for (var j = 0; j < this.original_width; ++j)
			if (this.marked[i][j] == 1)
				results.push([i, j]);
	
	return results;
};

/**
 * Create an n×n matrix, populating it with the specific value.
 */
Munkres.prototype.__make_matrix = function(n, val) {
	var matrix = [];
	for (var i = 0; i < n; ++i) {
		matrix[i] = [];
		for (var j = 0; j < n; ++j)
			matrix[i][j] = val;
	}
	
	return matrix;
};

/**
 * For each row of the matrix, find the smallest element and
 * subtract it from every element in its row. Go to Step 2.
 */
Munkres.prototype.__step1 = function() {
	for (var i = 0; i < this.n; ++i) {
		// Find the minimum value for this row and subtract that minimum
		// from every element in the row.
		var minval = Math.min.apply(Math, this.C[i]);
		
		for (var j = 0; j < this.n; ++j)
			this.C[i][j] -= minval;
	}
	
	return 2;
};

/**
 * Find a zero (Z) in the resulting matrix. If there is no starred
 * zero in its row or column, star Z. Repeat for each element in the
 * matrix. Go to Step 3.
 */
Munkres.prototype.__step2 = function() {
	for (var i = 0; i < this.n; ++i) {
		for (var j = 0; j < this.n; ++j) {
			if (this.C[i][j] == 0 &&
				!this.col_covered[j] &&
				!this.row_covered[i])
			{
				this.marked[i][j] = 1;
				this.col_covered[j] = true;
				this.row_covered[i] = true;
			}
		}
	}
	
	this.__clear_covers();
	
	return 3;
};

/**
 * Cover each column containing a starred zero. If K columns are
 * covered, the starred zeros describe a complete set of unique
 * assignments. In this case, Go to DONE, otherwise, Go to Step 4.
 */
Munkres.prototype.__step3 = function() {
	var count = 0;
	
	for (var i = 0; i < this.n; ++i) {
		for (var j = 0; j < this.n; ++j) {
			if (this.marked[i][j] == 1) {
				this.col_covered[j] = true;
				++count;
			}
		}
	}
	
	return (count >= n) ? 7 : 4;
};

/**
 * Find a noncovered zero and prime it. If there is no starred zero
 * in the row containing this primed zero, Go to Step 5. Otherwise,
 * cover this row and uncover the column containing the starred
 * zero. Continue in this manner until there are no uncovered zeros
 * left. Save the smallest uncovered value and Go to Step 6.
 */

Munkres.prototype.__step4 = function() {
	var done = false;
	var row = -1, col = -1, star_col = -1;
	
	while (!done) {
		var z = this.__find_a_zero();
		row = z[0];
		col = z[1];
		
		if (row < 0)
			return 6;
		
		this.marked[row][col] = 2;
		star_col = this.__find_star_in_row(row);
		if (star_col >= 0) {
			col = star_col;
			this.row_covered[row] = true;
			this.col_covered[col] = false;
		} else {
			this.Z0_r = row;
			this.Z0_c = col;
			return 5;
		}
	}
};

/**
 * Construct a series of alternating primed and starred zeros as
 * follows. Let Z0 represent the uncovered primed zero found in Step 4.
 * Let Z1 denote the starred zero in the column of Z0 (if any).
 * Let Z2 denote the primed zero in the row of Z1 (there will always
 * be one). Continue until the series terminates at a primed zero
 * that has no starred zero in its column. Unstar each starred zero
 * of the series, star each primed zero of the series, erase all
 * primes and uncover every line in the matrix. Return to Step 3
 */
Munkres.prototype.__step5 = function() {
	var count = 0;
	
	this.path[count][0] = this.Z0_r;
	this.path[count][1] = this.Z0_c;
	var done = false;
	
	while (!done) {
		var row = this.__find_star_in_col(this.path[count][1]);
		if (row >= 0) {
			count++;
			this.path[count][0] = row;
			this.path[count][1] = this.path[count-1][1];
		} else {
			done = true
		}

		if (!done) {
			var col = this.__find_prime_in_row(this.path[count][0]);
			count++;
			this.path[count][0] = this.path[count-1][0];
			this.path[count][1] = col;
		}
	}

	this.__convert_path(path, count);
	this.__clear_covers();
	this.__erase_primes();
	return 3;
};

/**
 * Add the value found in Step 4 to every element of each covered
 * row, and subtract it from every element of each uncovered column.
 * Return to Step 4 without altering any stars, primes, or covered
 * lines.
 */
Munkres.prototype.__step6 = function() {
	minval = this.__find_smallest();
	
	for (var i = 0; i < this.n; ++i) {
		for (var j = 0; j < this.n; ++j) {
			if (this.row_covered[i])
				this.C[i][j] += minval;
			if (!this.col_covered[j])
				this.C[i][j] -= minval;
		}
	}
	
	return 4;
};

/** Find the smallest uncovered value in the matrix. */
Munkres.prototype.__find_smallest = function() {
	var minval = maxsize;
	
	for (var i = 0; i < this.n; ++i)
		for (var j = 0; j < this.n; ++j)
			if (!this.row_covered[i] && !this.col_covered[j])
				if (minval > this.C[i][j])
					minval = this.C[i][j];
	
	return minval;
};

/** Find the first uncovered element with value 0 */
Munkres.prototype.__find_a_zero = function() {
	for (var i = 0; i < this.n; ++i)
		for (var j = 0; j < this.n; ++j)
			if (this.C[i][j] == 0 &&
				!this.row_covered[i] &&
				!this.col_covered[j])
				return [i, j];
	
	return [-1, -1];
};

/**
 * Find the first starred element in the specified row. Returns
 * the column index, or -1 if no starred element was found.
 */

Munkres.prototype.__find_star_in_row = function(row) {
	for (var j = 0; j < this.n; ++j)
		if (this.marked[row][j] == 1)
			return j;
	
	return -1;
};

/**
 * Find the first starred element in the specified column. Returns
 * the row index, or -1 if no starred element was found.
 */
Munkres.prototype.__find_star_in_col = function(col) {
	for (var i = 0; i < this.n; ++i)
		if (this.marked[i][col] == 1)
			return i;
	
	return -1;
};

/**
 * Find the first prime element in the specified row. Returns
 * the column index, or -1 if no starred element was found.
 */

Munkres.prototype.__find_prime_in_row = function(row) {
	for (var j = 0; j < this.n; ++j)
		if (this.marked[row][j] == 2)
			return j;
	
	return -1;
};

Munkres.prototype.__convert_path = function(path, count) {
	for (var i = 0; i <= count; ++i)
		this.marked[path[i][0]][path[i][1]] = 
			(this.marked[path[i][0]][path[i][1]] == 1) ? 0 : 1;
};

/** Clear all covered matrix cells */
Munkres.prototype.__clear_covers = function() {
	for (var i = 0; i < this.n; ++i) {
		this.row_covered[i] = false;
		this.col_covered[i] = false;
	}
};

/** Erase all prime markings */
Munkres.prototype.__erase_primes = function() {
	for (var i = 0; i < this.n; ++i)
		for (var j = 0; j < this.n; ++j)
			if (this.marked[i][j] == 2)
				this.marked[i][j] = 0;
};

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Create a cost matrix from a profit matrix by calling
 * 'inversion_function' to invert each value. The inversion
 * function must take one numeric argument (of any type) and return
 * another numeric argument which is presumed to be the cost inverse
 * of the original profit.
 * 
 * This is a static method. Call it like this:
 * 
 * 	cost_matrix = make_cost_matrix(matrix[, inversion_func]);
 * 
 * For example:
 * 
 * 	cost_matrix = make_cost_matrix(matrix, function(x) { return MAXIMUM - x; });
 * 
 * Parameters
 * 	profit_matrix : list of lists
 * 		The matrix to convert from a profit to a cost matrix
 * 
 * 	inversion_function : function
 * 		The function to use to invert each entry in the profit matrix
 * 
 * rtype list of lists
 * return The converted matrix
 */
function make_cost_matrix (profit_matrix, inversion_function) {
	if (!inversion_function) {
		var maximum = -1.0/0.0;
		for (var i = 0; i < profit_matrix.length; ++i)
			for (var j = 0; j < profit_matrix[i].length; ++j)
				if (profit_matrix[i][j] > maximum)
					maximum = profit_matrix[i][j];
		
		inversion_function = function(x) { return maximum - x; };
	}
	
	var cost_matrix = [];
	
	for (var i = 0; i < profit_matrix.length; ++i) {
		var row = profit_matrix[i];
		cost_matrix[i] = [];
		
		for (var j = 0; j < row.length; ++j)
			cost_matrix[i][j] = inversion_function(profit_matrix[i][j]);
	}
	
	return cost_matrix;
}

/**
 * Convenience function: Converts the contents of a matrix of integers
 * to a printable string.
 * 
 * Parameters
 * 	matrix : list of lists
 * 		Matrix to print
 */
function format_matrix(matrix) {
	function log10(v) {
		if (Math.log10)
			return Math.log10(v);
		return Math.log(v) / Math.log(10);
	}
	
	var columnWidths = [];
	for (var i = 0; i < matrix.length; ++i) {
		for (var j = 0; j < matrix[i].length; ++j) {
			var entryWidth = String(matrix[i][j]).length;
			
			if (!columnWidths[j] || entryWidth >= columnWidths[j])
				columnWidths[j] = entryWidth;
		}
	}
	
	var formatted = '';
	for (var i = 0; i < matrix.length; ++i) {
		for (var j = 0; j < matrix[i].length; ++j) {
			var s = String(matrix[i][j]);
			
			// pad at front with spaces
			while (s != columnWidths[j])
				s = ' ' + s;
			
			formatted += s;
			
			// separate columns
			if (j != matrix[i].length - 1)
				formatted += ' ';
		}
	}
	
	return formatted;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

if (exports) {
	exports.version = "1.1.0";
	exports.format_matrix = format_matrix;
	exports.make_cost_matrix = make_cost_matrix;
	exports.Munkres = Munkres;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (typeof require != 'undefined' &&
    typeof module != 'undefined' &&
    require.main == module) {
	var assert = require('assert');
	
	var matrices = [
		// Square
		[[[400, 150, 400],
		  [400, 450, 600],
		  [300, 225, 300]],
		 850],  // expected cost

		// Rectangular variant
		[[[400, 150, 400, 1],
		  [400, 450, 600, 2],
		  [300, 225, 300, 3]],
		 452],  // expected cost


		// Square
		[[[10, 10,  8],
		  [9,  8,  1],
		  [9,  7,  4]],
		 18],

		// Rectangular variant
		[[[10, 10,  8, 11],
		  [9,  8,  1, 1],
		  [9,  7,  4, 10]],
		 15]]

	var m = new Munkres();
	
	for (var k = 0; k < matrices.length; ++k) {
		var cost_matrix = matrices[k][0];
		var expected_total = matrices[k][1];
		
		console.log('cost matrix', format_matrix(cost_matrix));
		
		var indices = m.compute(cost_matrix);
		var total_cost = 0;
		
		for (var l = 0; l < indices.length; ++l) {
			var r = indices[l][0], c = indices[l][1];
			var x = cost_matrix[r][c];
			total_cost += x;
			
			console.log('(' + r + ', ' + c + ') -> ' + x);
		}
		
		console.log('lowest cost = ' + total_cost + ', expected = ' + expected_total);
		
		assert.equal(expected_total, total_cost);
	}
}
