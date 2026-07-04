-- Create the table for card game results
CREATE TABLE IF NOT EXISTS public.complex_game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    time_spent INT NOT NULL, -- in seconds
    matched_count INT NOT NULL,
    total_pairs INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    is_completed BOOLEAN NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.complex_game_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the leaderboard
CREATE POLICY "Allow public read access" 
ON public.complex_game_results 
FOR SELECT 
USING (true);

-- Allow public write access to record new scores
CREATE POLICY "Allow public insert access" 
ON public.complex_game_results 
FOR INSERT 
WITH CHECK (true);

-- Create index on score for leaderboard speed
CREATE INDEX IF NOT EXISTS idx_game_results_score ON public.complex_game_results (score DESC);
